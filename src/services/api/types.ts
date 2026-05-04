import type {
  Users,
  Contents,
  Messages,
  ParamOf,
  ResultOf,
} from "../../pl-serve-type-main/type/main.ts";

export interface PathMap {
  "/Users/Authenticate": Users["Authenticate"];
  "/Users/GetUser": Users["GetUser"];
  "/Users/ModifyInformation": Users["ModifyInformation"];
  "/Users/Rename": Users["Rename"];
  "/Users/Follow": Users["Follow"];
  "/Users/GetRelations": Users["GetRelations"];
  "/Users/Appoint": Users["Appoint"];
  "/Users/Ban": Users["Ban"];
  "/Users/Block": Users["Block"];
  "/Users/Logout": Users["Logout"];
  "/Users/ReceiveBonus": Users["ReceiveBonus"];
  "/Users/SetCover": Users["SetCover"];
  "/Users/Unban": Users["Unban"];

  "/Contents/QueryExperiments": Contents["QueryExperiments"];
  "/Contents/GetWorkspace": Contents["GetWorkspace"];
  "/Contents/GetLibrary": Contents["GetLibrary"];
  "/Contents/SubmitExperiment": Contents["SubmitExperiment"];
  "/Contents/GetDerivatives": Contents["GetDerivatives"];
  "/Contents/GetProfile": Contents["GetProfile"];
  "/Contents/ConfirmExperiment": Contents["ConfirmExperiment"];
  "/Contents/GetSummary": Contents["GetSummary"];
  "/Contents/MoveCategory": Contents["MoveCategory"];
  "/Contents/StarContent": Contents["StarContent"];
  "/Contents/GetSupporters": Contents["GetSupporters"];

  "/Messages/RemoveComment": Messages["RemoveComment"];
  "/Messages/GetComments": Messages["GetComments"];
  "/Messages/PostComment": Messages["PostComment"];
  "/Messages/GetMessage": Messages["GetMessage"];
  "/Messages/GetMessages": Messages["GetMessages"];
}

export type ApiPath = keyof PathMap & string;
export type APIParam<P extends ApiPath> = ParamOf<PathMap[P]>;
export type APIResult<P extends ApiPath> = ResultOf<PathMap[P]>;

/**
 * 运行时归一化：支持 `?user/GetUser` 等一些简写（不是必须，但常见）。
 */
export function normalizePath(path: string): string {
  if (path.startsWith("?")) {
    const p = path.slice(1);
    const [first, ...rest] = p.split("/");
    if (first) {
      const firstCap = first.charAt(0).toUpperCase() + first.slice(1);
      const firstFinal = firstCap.endsWith("s") ? firstCap : `${firstCap}s`;
      return `/${firstFinal}/${rest.join("/")}`;
    }
  }
  if (path.startsWith("/@api")) {
    return path.replace(/^\/@api/, "") || "/";
  }
  return path;
}

/**
 * 运行时已知路径列表，供拦截器和运行时检查使用。
 * 请注意：如果在此处添加/删除路径，请保持与上方 `PathMap` 接口一致。
//  */
// export const KNOWN_PATHS: ApiPath[] = [
//   "/Users/Authenticate",
//   "/Users/GetUser",
//   "/Users/ModifyInformation",
//   "/Users/Rename",
//   "/Users/Follow",
//   "/Users/GetRelations",
//   "/Users/Appoint",
//   "/Users/Ban",
//   "/Users/Block",
//   "/Users/Logout",
//   "/Users/ReceiveBonus",
//   "/Users/SetCover",
//   "/Users/Unban",

//   "/Contents/QueryExperiments",
//   "/Contents/GetWorkspace",
//   "/Contents/GetLibrary",
//   "/Contents/SubmitExperiment",
//   "/Contents/GetDerivatives",
//   "/Contents/GetProfile",
//   "/Contents/ConfirmExperiment",
//   "/Contents/GetSummary",
//   "/Contents/MoveCategory",
//   "/Contents/StarContent",

//   "/Messages/RemoveComment",
//   "/Messages/GetComments",
//   "/Messages/PostComment",
//   "/Messages/GetMessage",
//   "/Messages/GetMessages",
// ];
