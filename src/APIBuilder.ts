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
  constructor(
    public adapters: {
      response: (x: ResponseJson<unknown>) => ResponseJson<_Response>
    },
    public init?: RequestInit,
  ) { }
}

export class APIBuilderHTTPPostConfiguration<_Response> {
  constructor(
    public adapters: {
      response: (x: ResponseJson<unknown>) => ResponseJson<_Response>
    },
    public init?: RequestInit,
  ) { }
}

export class APIBuilderHTTP {
  static isResponseJson(response: ResponseUnion): response is ResponseJson<unknown> {
    return "json" in response;
  }

  static thenFilterResponseJson(response: ResponseUnion): ResponseJson<unknown> {
    if (APIBuilderHTTP.isResponseJson(response)) return response;
    throw new Error("The response is not ResponseJson");
  }
}

export class APIBuilderHTTPGet<_Response> {
  constructor(
    private _fetcher: Fetcher,
    private _path: string,
    private _configuration: APIBuilderHTTPGetConfiguration<_Response>,
  ) { }

  public get(): Promise<ResponseJson<_Response>> {
    return this
      ._fetcher
      .request(this._path, this._configuration.init)
      .then(APIBuilderHTTP.thenFilterResponseJson)
      .then(this._configuration.adapters.response)
  }
}

export class APIBuilderHTTPPost<_Response> {
  constructor(
    private _fetcher: Fetcher,
    private _path: string,
    private _configuration: APIBuilderHTTPPostConfiguration<_Response>,
  ) { }

  public post(): Promise<ResponseJson<_Response>> {
    return this
      ._fetcher
      .request(this._path, this._configuration.init)
      .then(APIBuilderHTTP.thenFilterResponseJson)
      .then(this._configuration.adapters.response)
  }
}

class APIRoute<
  _GET_Response = unknown
> {
  public get: APIBuilderHTTPGet<_GET_Response>["get"] | never;
  constructor(
    public _get: APIBuilderHTTPGet<_GET_Response> | null
  ) {
    const get = this._get ? this._get.get : undefined as never;
    this.get = get;
  }
}

export class APIBuilderRoute<
  _GET_Response = unknown
> {
  private _get: APIBuilderHTTPGet<_GET_Response> | null = null;

  constructor(
    public path: string,
    public fetcher: Fetcher,
  ) {}

  get<_Response>(configuration?: APIBuilderHTTPGetConfiguration<_Response>): APIBuilderRoute<_Response> {
    const self = this as unknown as APIBuilderRoute<_Response>; // be extremely cautious with this cast

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

    const get = new APIBuilderHTTPGet(this.fetcher, this.path, _configuration);
    self._get = get;
    return self;
  }

  _build(): APIRoute<_GET_Response> {
    return new APIRoute(
      this._get,
    )
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

  route(path: string, builderFn: (builder: APIBuilderRoute) => APIBuilderRoute): APIBuilderRoute {
    const builder = new APIBuilderRoute(path, this.fetcher);
    return builderFn(builder);
  }
}

