# Minimal API client

Small library for talking to REST APIs.

## Installation

```
pnpm add jsr:@dduel/api-client
```

## Usage

```js
import { API } from "jsr:@dduel/api-client"

const api = new API("/some/api/endpoint");
api
  .request("foo")
  .then(response => console.log(response))
  .catch(err => console.error(err));
```

### API

### `const api = new API(apiURL, [defaultOptions])`

Create a new `@dduel/api-client` instance. `apiURL` can be a full or relative URL. Optional `defaultOptions` include default `FetchInit`.

FetchInit being the second parameter of standard `fetch` call.

These opts are populated into requests, currently only headers are being populated.

### `api.request(path, [opts])`

Make a request to the `apiURL` at the given `path`. Optional `opts` are passed to the [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) API:

```js
// Default options
{
  headers: {} // Optional headers object.  Overrides defaultHeaders
  credentials: "same-origin" // set fetch credentials option
  "Content-Type": "application/json" // set Content-Type fetch option
}
```

Returns a promise with the `response`. If the `contentType` is JSON, it will be checked for pagination and return either the parsed JSON object or a paginated JSON object:

```js
// See src/pagination.js
{
  pagination: {
    last,
    next,
    prev,
    first,
    current,
    total
  },
  items: json
}
```

If an error occurs during the request, the promise may be rejected with an `HTTPError`, `TextHTTPError`, or `JSONHTTPError`.

### `class HTTPError extends Error`

Additional error properties from Error

```js
{
  stack, // stack trace of error
  status // status code of response
}
```

### `class TextHTTPError extends HTTPError`

Additional error properties from HTTPError

```js
{
  data // data of text response
}
```

### `class JSONHTTPError extends HTTPError`

Additional error properties from HTTPError

```js
{
  json // json of a JSON response
}
```

### `pagination = getPagination(response)`

Returns a pagination object that `micro-api-client` uses internally.
