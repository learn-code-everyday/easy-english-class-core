import { set } from "lodash";
import md5 from "md5";
import { ROLES } from "../../../constants/role.const";
import { onActivity } from "../../../events/onActivity.event";
import {encryptionHelper, ErrorHelper} from "../../../helpers";
import { Context } from "../../../core/context";
import { UserHelper } from "./user.helper";
import { userService } from "./user.service";
import { ActivityTypes, ChangedFactors } from "../activity/activity.model";
import {IUser, UserModel, UserRoles, UserStatuses} from "./user.model";
import {OrderModel} from "../../modules/order/order.model";
import mongoose from "mongoose";

const Query = {
  getAllUser: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.EDITOR, ROLES.MERCHANT]);
    if (context.tokenData.role === ROLES.MERCHANT) {
      args.q.filter = {
        ...args.q.filter,
        role: UserRoles.MERCHANT,
        status: UserStatuses.ACTIVE,
        referrenceId: context.tokenData._id,
      };
    }

    return userService.fetch(args.q);
  },
  getReferralTree: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_MEMBER_EDITOR);
    const { id } = args;
    return await userService.getReferralTree(id || context.id);
  },
  getOneUser: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.EDITOR]);
    const { id } = args;
    return await userService.findOne({ _id: id });
  },
  getUsersByRole: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { role, q } = args;
    if (!role || (role !== UserRoles.MERCHANT)) {
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
    context.auth([ROLES.ADMIN, ROLES.MERCHANT]);
    const { data } = args;

    await UserHelper.validateCreateUser(data, context);
    return await UserHelper.createUserWithRole(data, context);
  },
  updateUser: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;

    return await userService.updateOne(id, data);
  },
  updateUserMyProfile: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    if (context.tokenData.role != ROLES.ADMIN) context.isOwner(context.id);

    return await userService.updateOne(context.id, data);
  },
  updatePassword: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.MERCHANT]);
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
  infoReferrence: async (parent: { referrenceId: any; }) => {
    return UserModel.findById(parent.referrenceId);
  },
  sold: async (parent: { _id: any }) => {
    const result = await OrderModel.aggregate([
      { $match: { userId: parent._id } },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
        },
      },
    ]);

    return result[0]?.totalQuantity || 0;
  },
  countReferrence: async (parent: { _id: any }) => {
    return UserModel.estimatedDocumentCount({
      referrenceId: parent._id
    })
  },
};
const UserReferral = {
  infoReferrence: async (parent: { referrenceId: any; }) => {
    return UserModel.findById(parent.referrenceId);
  },
  sold: async (parent: { _id: any }) => {
    const result = await OrderModel.aggregate([
      { $match: { userId: parent._id } },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
        },
      },
    ]);

    return result[0]?.totalQuantity || 0;
  },
  countReferrence: async (parent: { _id: any }) => {
    return UserModel.countDocuments({
      referrenceId: parent._id
    })
  },
};

export default {
  Query,
  Mutation,
  User,
  UserReferral,
};
