import { ROLES } from "../../../../constants/role.const";
import { Context } from "../../../../core/context";
import { UserModel } from "../user.model";

const Query = {
  userGetMe: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_MEMBER_EDITOR);
    return await UserModel.findById(context.tokenData._id);
  },
};

export default {
  Query,
};
