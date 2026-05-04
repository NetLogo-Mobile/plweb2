import type { Serve } from "./type/index.ts";
import type { ID } from "./type/unit.ts";
import { APIRouterCategories } from "./type/enums.ts";
export interface Auth {
  Token?: string;
  AuthCode?: string;
  UserID?: ID;
  Nickname?: string;
  Login?: string;
  Password?: string;
  AppName?: string;
  Version?: number;
}
export interface UpstreamContext {
  upstream: {
    Href: string;
    Headers: HeadersInit;
  };
  signal?: AbortSignal;
  headers?: Headers;
  auth: Auth;
}
export var Upstream = class Upstream {
  constructor(public upstreamContext: UpstreamContext) {}
  static bindRouter(route: string) {
    return async function (
      this: { upstreamContext: UpstreamContext },
      query?: Serve.Param<unknown>,
    ): Promise<Serve.Result<unknown>> {
      var { upstreamContext: ctx } = this;
      if (route === "Users") {
        return (await fetch(ctx.upstream.Href + route)).json();
      }
      var headers = (ctx.headers ||= new Headers(ctx.upstream.Headers));
      headers.set("x-api-token", "7pEWTsF4gR9qauzJCDQkxPLOZlnbMtAG");
      if (ctx.auth.AuthCode) headers.set("x-api-AuthCode", ctx.auth.AuthCode);
      var r = await fetch(ctx.upstream.Href + route, {
          headers,
          body: JSON.stringify(query || null),
          signal: ctx.signal,
          method: "POST",
        }),
        t = r.headers.get("x-api-token");
      if (t && t !== ctx.auth.Token) {
        ctx.auth.Token = t;
      }
      return (r.headers.get("content-length") === "0"
        ? {
            Status: 500,
            Message: "Upstream.EmptyResponse",
            Data: {
              status: r.status,
              headers: [...r.headers],
              statusText: r.statusText,
            },
            AuthCode: r.headers.get("x-api-authcode"),
            Token: r.headers.get("x-api-token"),
          }
        : await r.json()) as unknown as Serve.Result<unknown>;
    };
  }
  static init() {
    Object.entries(APIRouterCategories).forEach(({ 0: route, 1: method }) => {
      // @ts-expect-error binding dynamic methods
      this.prototype[method] = this.bindRouter(`${route}/${method}`);
    });
    // @ts-expect-error setting HomePage
    this.prototype.HomePage = this.bindRouter("Users/");
    // @ts-expect-error deleting methods
    delete this.bindRouter;
    // @ts-expect-error deleting init method
    delete this.init;
    return this as unknown as {
      new (upstreamContext: UpstreamContext): Serve.Server & {
        upstreamContext: UpstreamContext;
      };
    };
  }
}.init();
