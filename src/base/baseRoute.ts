import express from "express";
import { ROLES } from "../constants/role.const";
import { validateJSON } from "../helpers";
import { IValidateSchema } from "../helpers";
import { resError } from "../helpers/resError.helper";

export interface Request extends express.Request {
  tokenInfo?: {
    roles_: keyof typeof ROLES;
    [name: string]: any;
  };
}
export interface Response extends express.Response {}
export interface NextFunction extends express.NextFunction {}

export abstract class BaseRoute {
  router: express.Router;
  constructor() {
    this.router = express.Router();
    this.customRouting();
  }

  abstract customRouting(): void;

  route(func: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) =>
      func
        .bind(this)(req, res, next)
        .catch((error: any) => {
          this.resError(res, error);
        });
  }
  response(res: Response, data: any, moreData: any = {}) {
    res.status(200).json({
      data,
      ...moreData,
    });
  }

  validateJSON(data: any, schema: IValidateSchema) {
    return validateJSON(data, schema);
  }

  resError(res: Response, error: any) {
    return resError(res, error);
  }
}
