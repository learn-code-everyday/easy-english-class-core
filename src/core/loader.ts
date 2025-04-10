import DataLoader from "dataloader";
import { Context } from "./context";
import { get, take } from "lodash";

export type ILoader = DataLoader<string, any, string>;

export class GraphLoader {
  static loadById(loader: ILoader
    , idField: string, option: { defaultValue: any } = {} as any) {
    return (root: any, args: any, context: Context) => {
      return root[idField]
        ? loader.load(root[idField].toString()).then((res: any) => res || option.defaultValue)
        : undefined;
    };
  }
  static loadManyById(loader: ILoader, idField: string, option: { defaultValue: any } = {} as any) {
    return (root: any, args: any, context: Context) => {
      console.log("root[idField]", root[idField]);
      return root[idField]
        ? loader
          .loadMany(args.limit ? take(root[idField], args.limit) : root[idField])
          .then((res: any[]) => res.map((r) => r || option.defaultValue))
        : undefined;
    };
  }
  static requireRoles(roles: string[]) {
    return (root: any, args: any, context: Context, info: any) => {
      context.auth(roles);
      return root[info.fieldName];
    };
  }
  static dependOnFieldEq(field: string, equal: any, next: any) {
    return (root: any, args: any, context: Context) => {
      return get(root, field) == equal ? next(root, args, context) : null;
    };
  }
}
