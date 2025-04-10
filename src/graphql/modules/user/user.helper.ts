import { ROLES } from "../../../constants/role.const";
import { ErrorHelper, KeycodeHelper } from "../../../helpers";
import { TokenHelper } from "../../../helpers/token.helper";
import { Context } from "../../../core/context";
import { counterService } from "../counter/counter.service";
import { IUser, UserModel } from "./user.model";

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
}
