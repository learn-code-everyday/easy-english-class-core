import { set } from "lodash";
import md5 from "md5";
import { ROLES } from "../../../constants/role.const";
import { onActivity } from "../../../events/onActivity.event";
import { encryptionHelper } from "../../../helpers";
import { Context } from "../../../core/context";
import { UserHelper } from "./user.helper";
import { userService } from "./user.service";
import { ActivityTypes, ChangedFactors } from "../activity/activity.model";
import { IUser, UserRoles } from "./user.model";

const Query = {
  getAllUser: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.EDITOR, ROLES.MERCHANT]);
    if (context.tokenData.role === ROLES.MERCHANT) {
      args.q = {
        ...args.q,
        role: UserRoles.SALES,
        referrenceId: context.tokenData._id,
      };
    }

    return userService.fetch(args.q);
  },
  getOneUser: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.EDITOR]);
    const { id } = args;
    return await userService.findOne({ _id: id });
  },

  getUsersByRole: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { role, q } = args;
    if (!role || (role !== UserRoles.MERCHANT && role !== UserRoles.SALES)) {
      throw new Error("Invalid role. Only MERCHANT or SALES allowed.");
    }
    const query = {
      ...q,
      role: role,
    };

    return userService.fetch(query);
  },
};

const Mutation = {
  createUser: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.MERCHANT]);
    const { data } = args;

    await UserHelper.validateCreateUser(data, context);
    return await UserHelper.createUserWithRole(data, context);
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

  updateUserMyProfile: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    if (context.tokenData.role != ROLES.ADMIN) context.isOwner(context.id);

    return await userService.updateOne(context.id, data);
  },

  updatePassword: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.MERCHANT, ROLES.SALES]);
    const { currentPassword, newPassword } = args;
    if (!newPassword || newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long");
    }

    const user: any = await userService.findOne({ _id: context.id });
    if (!user) {
      throw new Error("User not found");
    }

    if (context.tokenData.role !== ROLES.ADMIN && !user.isFirstLogin) {
      if (!currentPassword) {
        throw new Error("Current password is required");
      }

      const hashedCurrentPassword = encryptionHelper.createPassword(
        md5(currentPassword).toString(),
        user.id,
      );

      if (user.password !== hashedCurrentPassword) {
        throw new Error("Current password is incorrect");
      }
    }

    const hashedNewPassword = encryptionHelper.createPassword(md5(newPassword).toString(), user.id);

    const updatedUser = await userService.updateOne(user.id, {
      password: hashedNewPassword,
      isFirstLogin: false,
    });

    onActivity.next({
      userId: context.id,
      factorId: updatedUser.id,
      type: ActivityTypes.UPDATE,
      changedFactor: ChangedFactors.USER,
    });

    return updatedUser;
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
