import md5 from "md5";
import { ROLES } from "../../../constants/role.const";
import { onActivity } from "../../../events/onActivity.event";
import { encryptionHelper, ErrorHelper } from "../../../helpers";
import { Context } from "../../../core/context";
import { UserHelper } from "./user.helper";
import { userService } from "./user.service";
import { ActivityTypes, ChangedFactors } from "../activity/activity.model";
import { UserModel, UserRoles, UserStatuses } from "./user.model";

const Query = {
  getAllUser: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.CUSTOMER]);
    // if (context.tokenData.role === ROLES.MERCHANT) {
    //   args.q.filter = {
    //     ...args.q.filter,
    //     role: UserRoles.MERCHANT,
    //     status: UserStatuses.ACTIVE,
    //     referrenceId: context.tokenData._id,
    //   };
    // }

    return userService.fetch(args.q);
  },
  getOneUser: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.CUSTOMER]);
    const { id } = args;
    return await userService.findOne({ _id: id });
  },
};

const Mutation = {
  resetPassword: async (root: any, args: any, context: Context) => {
    const { gmail } = args;

    return await userService.resetPassword(gmail);
  },
  verifyResetCode: async (root: any, args: any, context: Context) => {
    const { gmail, code } = args;

    return await userService.verifyResetCode(gmail, code);
  },
  confirmPasswordReset: async (root: any, args: any, context: Context) => {
    const { gmail, code, newPassword } = args;

    return await userService.confirmPasswordReset(gmail, code, newPassword);
  },
  createUser: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.CUSTOMER]);
    const { data } = args;

    await UserHelper.validateCreateUser(data, context);
    return await UserHelper.createUserWithRole(data, context);
  },
  updateUser: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id, data } = args;

    return await userService.updateOne(id, data);
  },
  updateUserMyProfile: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.CUSTOMER]);
    const { data } = args;
    if (context.tokenData.role != ROLES.ADMIN) context.isOwner(context.id);

    return await userService.updateOne(context.id, data);
  },
  updatePassword: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.CUSTOMER]);
    const { currentPassword, newPassword } = args;

    if (!newPassword || newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long");
    }

    const user: any = await userService.findOne({ _id: context.id });
    if (!user) {
      throw ErrorHelper.userNotExist();
    }

    const validPassword = encryptionHelper.comparePassword(currentPassword, user.id, user.password);
    if (!validPassword) {
      throw ErrorHelper.userPasswordNotCorrect();
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

const User = {
  infoReferrence: async (parent: { referrenceId: any }) => {
    return UserModel.findById(parent.referrenceId);
  },
  countReferrence: async (parent: { _id: any }) => {
    return UserModel.estimatedDocumentCount({
      referrenceId: parent._id,
    });
  },
};
const UserReferral = {
  infoReferrence: async (parent: { referrenceId: any }) => {
    return UserModel.findById(parent.referrenceId);
  },
  countReferrence: async (parent: { _id: any }) => {
    return UserModel.countDocuments({
      referrenceId: parent._id,
    });
  },
};

export default {
  Query,
  Mutation,
  User,
  UserReferral,
};
