import { ROLES } from "../../../constants/role.const";
import { encryptionHelper, ErrorHelper } from "../../../helpers";
import { TokenHelper } from "../../../helpers/token.helper";
import { Context } from "../../../core/context";
import { counterService } from "../counter/counter.service";
import { IUser, UserModel, UserRoles, UserStatuses } from "./user.model";
import { userService } from "./user.service";
import { set } from "lodash";
import md5 from "md5";
import { mailService } from "../mails/mails.service";

export class UserHelper {
  constructor(public user: IUser) {}

  static async fromContext(context: Context) {
    if (!ROLES.ADMIN_MEMBER_EDITOR.includes(context.tokenData.role)) return null;
    const user = await UserModel.findById(context.tokenData._id);
    if (!user) throw ErrorHelper.permissionDeny();
    return new UserHelper(user);
  }

  static generateCode() {
    return counterService.trigger("user").then((c) => "U" + c);
  }

  getToken() {
    return TokenHelper.generateToken({
      role: this.user.role,
      _id: this.user._id,
      name: this.user.name,
      status: this.user.status,
    });
  }
  static async validateCreateUser(data: any, context: Context) {
    const existingUserByEmail = await userService.findOne({ gmail: data.gmail });
    if (existingUserByEmail) {
      throw new Error("Email already exists");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.gmail)) {
      throw new Error("Invalid gmail format");
    }

    if (data.name.length < 2 || data.name.length > 50) {
      throw new Error("Name must be between 2-50 characters");
    }

    if (data.role && !Object.values(UserRoles).includes(data.role)) {
      throw new Error("Invalid user role");
    }

    if (data.role === UserRoles.SALES && context.tokenData.role !== ROLES.MERCHANT) {
      throw new Error("Only MERCHANT can create SALES users");
    }
    return true;
  }

  static createUserWithRole = async (data: any, context: Context) => {
    const password = md5(data.password).toString();

    let level = 1;
    if (context.tokenData.role === UserRoles.MERCHANT) {
      level = (context.tokenData.level || 0) + 1;
    }

    const userData = {
      ...data,
      referralCode: await UserHelper.generateCode(),
      status: UserStatuses.ACTIVE,
      isFirstLogin: true,
      level,
      referrenceId: context.id,
    };

    return await userService.create(userData).then(async (result: any) => {
      const hashPassword = encryptionHelper.createPassword(password, result.id);
      set(result, "password", hashPassword);

      await result.save();
      try {
        await mailService.sendWelcomeEmail({
          name: result.name,
          gmail: result.gmail,
          role: result.role,
          tempPassword: data.password,
        });
      } catch (error) {}

      return result;
    });
  };
}
