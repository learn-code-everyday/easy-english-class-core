import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { commissionsService } from "./commissions.service";
import {UserModel} from "../../modules/user/user.model";
import {OrderModel} from "../../modules/order/order.model";
import {set} from "lodash";

const Query = {
  getAllCommissions: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_MEMBER_MERCHANT);
    if (context.isMerchantOrSeller()) {
      set(args, "q.filter.userId", context.id);
    } else if (context.isSuperAdmin()) {
      // Filter commissions for users in the same branch based on referenceId
      const currentUser = await UserModel.findById(context.id);
      if (currentUser && currentUser.referrenceId) {
        // Get all users in the same branch (descendants)
        const branchUsers = await UserModel.find({
          referrenceId: currentUser.id
        }).select("_id");

        const branchUserIds = branchUsers.map((user) => user._id);
        
        // Get orders from users in the branch
        const orders = await OrderModel.find({ 
          userId: { $in: branchUserIds } 
        }).select("_id");
        const orderIds = orders.map(order => order._id);
        
        if (orderIds.length > 0) {
          set(args, "q.filter.orderId.$in", orderIds);
        } else {
          // No orders = no commissions to show
          set(args, "q.filter.orderId.$in", []);
        }
      }
    }
    return commissionsService.fetch(args.q);
  },
  getOneCommissions: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_MEMBER_MERCHANT);
    const { id } = args;
    return await commissionsService.findOne({ _id: id });
  },
};

const Mutation = {
  createCommissions: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    return await commissionsService.create(data);
  },
  updateCommissions: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await commissionsService.updateOne(id, data);
  },
  deleteOneCommissions: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id } = args;
    return await commissionsService.deleteOne(id);
  },
};

const Commissions = {
  order: async (parent: { orderId: any; }) => {
    return OrderModel.findById(parent.orderId);
  },
  user: async (parent: { userId: any; }) => {
    return UserModel.findById(parent.userId);
  },
};

export default {
  Query,
  Mutation,
  Commissions,
};
