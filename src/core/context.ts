import { Request } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import _ from "lodash";

import { ROLES } from "../constants/role.const";
import { TokenHelper } from "../helpers/token.helper";
import { ErrorHelper } from "./error";

export type TokenData = {
  role: string;
  _id: string;
  [name: string]: any;
};

export type SignedRequestPayload = {
  psid: string;
  algorithm: string;
  thread_type: string;
  tid: string;
  issued_at: number;
  page_id: number;
};

export class Context {
  req: Request;
  isAuth = false;
  isTokenExpired = false;
  tokenData: TokenData;
  passwordToken: string;
  emailToken: string;
  recoveryToken: string;
  userToken: string;
  shopToken: string;
  referralToken: string;
  sigToken: string;

  constructor(params: { req?: Request; connection?: any }) {
    this.req = params.req;
    this.parseToken(params);
    this.getPasswordToken(params);
    this.getAccountRecoveryToken(params);
    this.getUserToken(params);
    this.getReferralToken(params);
    this.getSigToken(params);
    this.getEmailToken(params);
  }

  isAdmin() {
    return _.get(this.tokenData, "role") === ROLES.ADMIN;
  }
  isMember() {
    return _.get(this.tokenData, "role") === ROLES.MEMBER;
  }
  isCustomer() {
    return _.get(this.tokenData, "role") === ROLES.CUSTOMER;
  }
  get id() {
    return _.get(this.tokenData, "_id");
  }
  get userAgent() {
    return _.get(this.req.headers, "user-agent");
  }
  get ipAddress() {
    return _.get(this.req.headers, "x-forwarded-for") || _.get(this.req.headers, "remoteAddress");
  }

  getEmailToken(params: any) {
    this.emailToken = _.get(params.req, "headers.e-token");
  }

  getPasswordToken(params: any) {
    this.passwordToken = _.get(params.req, "headers.y-token");
  }

  getAccountRecoveryToken(params: any) {
    this.recoveryToken = _.get(params.req, "headers.r-token");
  }

  getUserToken(params: any) {
    this.userToken = _.get(params.req, "headers.u-token");
  }

  getSigToken(params: any) {
    this.sigToken = _.get(params.req, "headers.s-token");
  }

  getReferralToken(params: any) {
    this.referralToken = _.get(params.req, "headers.rf-token");
  }

  parseToken(params: any) {
    try {
      const { req, connection } = params;
      let token = null;

      if (req) {
        this.req = req;
        token = _.get(req.headers, "x-token") || _.get(req.query, "x-token");
      }

      if (connection && connection.context) {
        token = connection.context["x-token"];
      }

      if (token) {
        const decodedToken: any = TokenHelper.decodeToken(token);
        this.isAuth = true;
        this.tokenData = decodedToken;
      }
    } catch (err) {
      console.log("err", err);
      if (err instanceof TokenExpiredError) {
        this.isTokenExpired = true;
      }
      this.isAuth = false;
    }
  }

  auth(roles: String[]) {
    if (!this.isAuth) throw ErrorHelper.unauthorized();
    if (roles.indexOf(this.tokenData.role) !== -1) {
      return;
    } else {
      if (this.isTokenExpired) throw ErrorHelper.tokenExpired();
      throw ErrorHelper.permissionDeny();
    }
  }

  isOwner(_id: any) {
    if (this.isTokenExpired) {
      throw ErrorHelper.tokenExpired();
    }
    if (!this.isAuth) {
      throw ErrorHelper.unauthorized();
    }

    if (this.tokenData!._id.toString() != _id.toString()) {
      throw ErrorHelper.permissionDeny();
    }
  }
}

export async function onContext(params: any) {
  return new Context(params);
}
