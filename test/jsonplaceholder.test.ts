import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { API } from "../src/mod.ts";

describe("jsonplaceholder.typicode.com", () => {
  test("fetch and return text", async () => {
    const api = new API("https://jsonplaceholder.typicode.com");
    const _response = await api.request("/posts/1");

    assert.ok(_response);
    assert.ok(typeof _response === "object")

    const response = _response as Record<string, unknown>; // lazy type cast

    assert.ok("userId" in response);
    assert.ok("id" in response);
    assert.ok("title" in response);
    assert.ok("body" in response);

    assert.equal(response.userId, 1);
    assert.equal(response.id, 1);
    assert.equal(response.title, "sunt aut facere repellat provident occaecati excepturi optio reprehenderit");
    assert.equal(response.body, "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto")
  });
});

