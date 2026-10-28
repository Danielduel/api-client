import { Fetcher, ResponseJson } from "./Fetcher.ts";
import type { ResponseUnion } from "./Fetcher.ts";

// Template param order
// 
// Request
// Response
// Query
// Params
//
// of
//
// GET
// POST
// PATCH
// PUT
// DELETE

export class APIBuilderHTTPGetConfiguration<_Response> {
  constructor (
    public adapters: {
      response: (x: ResponseJson<unknown>) => ResponseJson<_Response>
    },
    public init?: RequestInit,
  ) {}
}

export class APIBuilderHTTPGet<_Response> {
  constructor (
    private _fetcher: Fetcher,
    private _path: string,
    private _configuration: APIBuilderHTTPGetConfiguration<_Response>,
  ) {}

  private static isResponseJson(response: ResponseUnion): response is ResponseJson<unknown> {
    return "json" in response;
  }

  private static thenFilterResponseJson(response: ResponseUnion): ResponseJson<unknown> {
    if (APIBuilderHTTPGet.isResponseJson(response)) return response;
    throw new Error("The response is not ResponseJson");
  }

  public get() {
    return this
      ._fetcher
      .request(this._path, this._configuration.init)
      .then(APIBuilderHTTPGet.thenFilterResponseJson)
      .then(this._configuration.adapters.response)
  }
}

export class APIBuilder {
  public fetcher: Fetcher;
  constructor(
    public URL: string,
    fetcher?: Fetcher
  ) {
    this.URL = URL;
    this.fetcher = fetcher || new Fetcher(URL, {});
  }

  get<_Response>(path: string, configuration?: APIBuilderHTTPGetConfiguration<_Response>) {
    const _configuration: APIBuilderHTTPGetConfiguration<_Response> = { 
      ...configuration,
      init: {
        method: "GET",
        ...configuration?.init
      },
      adapters: {
        response: x => x as ResponseJson<_Response>,
        ...configuration?.adapters,
      },
    };

    return new APIBuilderHTTPGet(this.fetcher, path, _configuration); 
  }
}

