import { ROLES } from "../../../../constants/role.const";
import { Context } from "../../../../core/context";
import { UserModel } from "../user.model";

const Query = {
  userGetMe: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.MERCHANT, ROLES.SALES]);
    return await UserModel.findById(context.tokenData._id);
  },
};

export default {
  Query,
};
