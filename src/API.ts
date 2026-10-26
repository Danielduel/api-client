// import { getPagination } from "./pagination";
// export { getPagination } from "./pagination";

import type { HeadersInit } from "undici-types";

export class HTTPError extends Error {
  status: Response["status"]; // number
  stack?: string;

  constructor(
    response: Response
  ) {
    super(response.statusText);
    this.name = this.constructor.name;
    if ("captureStackTrace" in Error && typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      const stack = new Error(response.statusText).stack;
      if (stack) { // typeguards with exactOptionalTypes are tripping assingment here
        this.stack = stack;
      }
    }
    this.status = response.status;
  }
}

export class TextHTTPError extends HTTPError {
  constructor(
    response: Response,
    public data: string
  ) {
    super(response);
  }
}

export class JSONHTTPError extends HTTPError {
  constructor(
    response: Response,
    public json: unknown
  ) {
    super(response);
  }
}

export class API {
  private sameOrigin = false;
  private defaultHeaders: HeadersInit = {};

  constructor(
    public apiURL = "",
    public defaultOptions: RequestInit = {}
  ) {
    this.apiURL = apiURL;
    if (this.apiURL.match(/\/[^\/]?/)) {
      this.sameOrigin = true;
    }
    if (defaultOptions?.headers) {
      this.defaultHeaders = defaultOptions.headers;
    }
  }

  headers(headers: HeadersInit = {}): HeadersInit {
    return {
      ...this.defaultHeaders,
      "Content-Type": "application/json",
      ...headers
    };
  }

  parseJsonResponse(response: Response): Promise<unknown> {
    return response.json().then(json => {
      if (!response.ok) {
        return Promise.reject(new JSONHTTPError(response, json));
      }

      // const pagination = getPagination(response);
      // return pagination ? { pagination, items: json } : json;
      return json
    });
  }

  request(path: string, options: RequestInit = {}): Promise<unknown> {
    const headers = this.headers(options.headers || {});

    if (this.sameOrigin) {
      options.credentials = options.credentials || "same-origin";
    }

    return fetch(this.apiURL + path, { ...options, headers })
      .then(response => {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.match(/json/)) {
          return this.parseJsonResponse(response);
        }

        if (!response.ok) {
          return response.text().then(data => {
            return Promise.reject(new TextHTTPError(response, data));
          });
        }
        return response.text().then(data => {
          data;
        });
      });
  }
}
