import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { orderService } from "./order.service";
import { CustomerModel } from "../../modules/customer/customer.model";
import { set } from "lodash";
import { UserModel } from "../../modules/user/user.model";

const Query = {
  getAllOrder: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_MEMBER_MERCHANT);
    if (context.isMerchantOrSeller()) {
      set(args, "q.filter.userId", context.id);
    } else if (context.isSuperAdmin()) {
      // Filter orders for users in the same branch based on referenceId
      const currentUser = await UserModel.findById(context.id);
      if (currentUser && currentUser.referrenceId) {
        // Get all users in the same branch (descendants)
        const branchUsers = await UserModel.find({
          referrenceId: currentUser.id,
        }).select("_id");

        const branchUserIds = branchUsers.map((user) => user._id);
        set(args, "q.filter.userId.$in", branchUserIds);
      }
    }

    console.log("args.q.filter", args.q.filter);
    return orderService.fetch(args.q);
  },
  getOneOrder: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_MEMBER_MERCHANT);
    if (context.isMerchantOrSeller()) {
      set(args, "q.filter.userId", context.id);
    } else if (context.isSuperAdmin()) {
      // Filter orders for users in the same branch based on referenceId
      const currentUser = await UserModel.findById(context.id);
      if (currentUser && currentUser.referrenceId) {
        // Get all users in the same branch (descendants)
        const branchUsers = await UserModel.find({
          referrenceId: currentUser.id,
        }).select("_id");

        const branchUserIds = branchUsers.map((user) => user._id);
        set(args, "q.filter.userId.$in", branchUserIds);
      }
    }
    const { id } = args;
    return await orderService.findOne({ _id: id });
  },
};

const Mutation = {
  createOrder: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    return await orderService.createOrder(context.id, data);
  },
  updateOrder: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_MEMBER);
    const { id, data } = args;
    return await orderService.updateOrder(id, data);
  },
  updateOrderForAdmin: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_MEMBER);
    const { id, data } = args;
    return await orderService.updateOrderForAdmin(id, data);
  },
  deleteOneOrder: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id } = args;
    return await orderService.deleteOne(id);
  },
};

const Order = {
  customer: async (parent: { customerId: any }) => {
    return CustomerModel.findById(parent.customerId);
  },
  user: async (parent: { userId: any }) => {
    return UserModel.findById(parent.userId);
  },
};

export default {
  Query,
  Mutation,
  Order,
};
