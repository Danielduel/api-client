import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { Fetcher, APIBuilder } from "../src/mod.ts";

describe("jsonplaceholder.typicode.com", () => {
  test("fetcher: request and return object", async () => {
    const api = new Fetcher("https://jsonplaceholder.typicode.com");
    const _response = await api.request("/posts/1");

    assert.ok(_response);
    assert.ok(typeof _response === "object");
    assert.ok("json" in _response);

    const response = _response.json as Record<string, unknown>; // lazy type cast

    assert.ok("userId" in response);
    assert.ok("id" in response);
    assert.ok("title" in response);
    assert.ok("body" in response);

    assert.equal(response.userId, 1);
    assert.equal(response.id, 1);
    assert.equal(response.title, "sunt aut facere repellat provident occaecati excepturi optio reprehenderit");
    assert.equal(response.body, "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto")
  });

  test("api: get and return validated response without requiring definition of request", async () => {
    const builder = new APIBuilder("https://jsonplaceholder.typicode.com")
    const client = {
      posts: builder.get("/posts", {
        adapters: {
          response: (response) => { // keep slow types
            const x = response.json;
            // type sanity check, keep verbosity

            type Item = {
              userId: string;
              id: string;
              title: string;
              body: string;
            };

            // I miss my zod
            const isItem = (item: unknown): item is Item => {
              if (typeof item !== "object") throw new Error("Item is not an object");
              if (!item) throw new Error("Item is null");
              if (!("userId" in item)) throw new Error("Item has no userId");
              if (typeof item.userId !== "number") throw new Error("Item.userId is not a number");
              if (!("id" in item)) throw new Error("Item has no id");
              if (typeof item.id !== "number") throw new Error("Item.id is not a number");
              if (!("title" in item)) throw new Error("Item has no title");
              if (typeof item.title !== "string") throw new Error("Item.title is not a string");
              if (!("body" in item)) throw new Error("Item has no body");
              if (typeof item.body !== "string") throw new Error("Item.body is not a string");
              return true;
            }

            const isArrayOfItem = (array: unknown): array is Item[] => {
              if (!Array.isArray(array)) throw new Error("Not an array");
              
              const childrenAreItem = array.every(isItem);
              if (!childrenAreItem) throw new Error("Children aren't item"); // technically it will throw and fail in the isItem

              return true;
            }

            if (isArrayOfItem(x)) return response.__validated(x);

            throw new Error("Failed validation")
          }
        }
      })
    };

    const _response = await client.posts.get()!; // asserting the ! next line

    const response = _response.json;
    assert.ok(!!response);
    assert.ok(!!response[0]);
    assert.ok(!!response[1]);
    assert.ok(!!response[2]);
    assert.ok(!!response[3]);
    
    assert.equal<string>(1, response[0].id);
    assert.equal<string>(1, response[1].userId);
  })
});

