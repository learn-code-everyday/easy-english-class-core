import md5 from "md5";
import base from "../../../configs/base";
import { ROLES } from "../../../constants/role.const";
import { ErrorHelper, KeycodeHelper } from "../../../helpers";
import { randomNumberHelper } from "../../../helpers/randomNumber.helper";
import { TokenHelper } from "../../../helpers/token.helper";
import { Context } from "../../../core/context";
import { counterService } from "../counter/counter.service";
import { google } from "googleapis";
import { CustomerModel, CustomerStatuses, ICustomer } from "./customer.model";

export class CustomerHelper {
  constructor(public customer: ICustomer) {}

  static async getEmailByOAUTH2(idToken: string) {
    try {
      const { googleClientId, googleClientSecret } = base;

      const oauth2Client = new google.auth.OAuth2(googleClientId, googleClientSecret);

      const ticket = await oauth2Client.verifyIdToken({
        idToken,
      });

      const payload = ticket.getPayload();
      const { email } = payload;

      return email;
    } catch (error) {
      throw ErrorHelper.error("Google authentication error.");
    }
  }

  static async fromContext(context: Context) {
    if (!ROLES.CUSTOMER.includes(context.tokenData.role)) return null;
    const customer = await CustomerModel.findById(context.tokenData._id);
    if (!customer) throw ErrorHelper.permissionDeny();
    return new CustomerHelper(customer);
  }

  setActiveAt() {
    if (this.customer.status === CustomerStatuses.ACTIVE && !this.customer.activeAt) {
      this.customer.activeAt = new Date();
    }
    return this;
  }

  static async validContextAsCustomer(customerId: string) {
    const customer = await CustomerModel.findById(customerId);
    return this.validCustomer(customer);
  }

  static async validCustomer(customer: ICustomer) {
    if (!customer) {
      throw ErrorHelper.unauthorized();
    }

    if (customer.status === CustomerStatuses.INACTIVE) {
      throw ErrorHelper.permissionDeny();
    }

    return customer;
  }

  static generateCode() {
    return counterService.trigger("user").then((c) => "U" + c);
  }

  static async generateReferralCode(secret: string) {
    let referral = randomNumberHelper(100000000, 999999999);
    let countCode = await CustomerModel.countDocuments({ referral });
    while (countCode > 0) {
      referral = randomNumberHelper(100000000, 999999999);
      countCode = await CustomerModel.countDocuments({ referral });
    }
    return referral;
  }

  static async generateEmailVerifyCode(secret: string) {
    let code = md5(KeycodeHelper.alpha(secret, 50));
    let countCode = await CustomerModel.countDocuments({ emailVerifyToken: code });
    while (countCode > 0) {
      code = md5(KeycodeHelper.alpha(secret, 50));
      countCode = await CustomerModel.countDocuments({ emailVerifyToken: code });
    }
    return code;
  }

  static async generateNonce(secret: string) {
    let nonce = KeycodeHelper.alpha(secret, 10);
    let countCode = await CustomerModel.countDocuments({ nonce });
    while (countCode > 0) {
      nonce = KeycodeHelper.alpha(secret, 10);
      countCode = await CustomerModel.countDocuments({ nonce });
    }
    return nonce;
  }

  getToken() {
    return TokenHelper.generateToken({
      role: this.customer.role,
      _id: this.customer._id,
      firstname: this.customer.firstname,
      lastname: this.customer.lastname,
      status: this.customer.status,
    });
  }
}
