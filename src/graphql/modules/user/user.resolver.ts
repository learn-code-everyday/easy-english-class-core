import { set } from "lodash";
import md5 from "md5";
import { ROLES } from "../../../constants/role.const";
import { onActivity } from "../../../events/onActivity.event";
import { encryptionHelper } from "../../../helpers";
import { Context } from "../../../core/context";
import { UserHelper } from "./user.helper";
import { userService } from "./user.service";
import { ActivityTypes, ChangedFactors } from "../activity/activity.model";
import { IUser, UserStatuses } from "./user.model";

const Query = {
  getAllUser: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.EDITOR]);
    return userService.fetch(args.q);
  },
  getOneUser: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.EDITOR]);
    const { id } = args;
    return await userService.findOne({ _id: id });
  },
};

const Mutation = {
  createUser: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { data } = args;
    data.code = await UserHelper.generateCode();

    data.status = UserStatuses.ACTIVE;
    const password = md5(data.password).toString();

    return await userService.create(data).then(async (result) => {
      const hashPassword = encryptionHelper.createPassword(password, result.id);
      set(result, "password", hashPassword);
      // console.log("result", result);
      onActivity.next({
        userId: context.id,
        factorId: result.id,
        type: ActivityTypes.CREATE,
        changedFactor: ChangedFactors.USER,
      });

      await result.save();
      return result;
    });
  },

  updateUser: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    if (context.tokenData.role != ROLES.ADMIN) context.isOwner(id);

    const password = data.password ? md5(data.password).toString() : null;

    return await userService.updateOne(id, data).then(async (result: IUser) => {
      onActivity.next({
        userId: context.id,
        factorId: result.id,
        type: ActivityTypes.UPDATE,
        changedFactor: ChangedFactors.USER,
      });

      if (password) {
        const hashPassword = encryptionHelper.createPassword(password, result.id);
        set(result, "password", hashPassword);
        // console.log("result", result);
        const userHelper = new UserHelper(result);
        return await userHelper.user.save();
      }

      return result;
    });
  },

  deleteOneUser: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id } = args;
    return await userService.deleteOne(id).then((res) => {
      onActivity.next({
        userId: context.id,
        factorId: res.id,
        type: ActivityTypes.DELETE,
        changedFactor: ChangedFactors.USER,
      });
      return res;
    });
  },
};

const User = {};

export default {
  Query,
  Mutation,
  User,
};
