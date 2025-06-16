import {ROLES} from "../../../constants/role.const";
import {onActivity} from "../../../events/onActivity.event";
import {Context} from "../../../core/context";
import {customerService} from "./customer.service";
import {ActivityTypes, ChangedFactors} from "../activity/activity.model";
import {MinerModel} from "../../modules/miner/miner.model";
import {UserModel} from "../../modules/user/user.model";
import {OrderModel} from "../../modules/order/order.model";
import {set} from "lodash";

const Query = {
  getAllCustomer: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    if (context.isMerchantOrSeller()) {
      // Get customers from orders created by this user
      const orders = await OrderModel.find({ userId: context.id }).select("customerId");
      const customerIds = orders.map(order => order.customerId).filter(Boolean);
      if (customerIds.length > 0) {
        set(args, "q.filter._id.$in", customerIds);
      } else {
        // No orders = no customers to show
        set(args, "q.filter._id.$in", []);
      }
    } else if (context.isSuperAdmin()) {
      // Filter customers for users in the same branch based on referenceId
      const currentUser = await UserModel.findById(context.id);
      if (currentUser && currentUser.referrenceId) {
        // Get all users in the same branch (descendants)
        const branchUsers = await UserModel.find({
          referrenceId: currentUser.id
        }).select("_id");

        const branchUserIds = branchUsers.map((user) => user._id);
        
        // Get customers from orders created by users in the branch
        const orders = await OrderModel.find({ 
          userId: { $in: branchUserIds } 
        }).select("customerId");
        const customerIds = orders.map(order => order.customerId).filter(Boolean);
        
        if (customerIds.length > 0) {
          set(args, "q.filter._id.$in", customerIds);
        } else {
          // No orders = no customers to show
          set(args, "q.filter._id.$in", []);
        }
      }
    }
    return customerService.fetch(args.q);
  },
  getOneCustomer: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id } = args;
    return await customerService.findOne({ _id: id });
  },
  getCustomerForAdmin: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { gmail, referralCode } = args.data;
    return await customerService.findOne({ gmail, referralCode });
  },
  customerGetMe: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.CUSTOMER]);
    return await customerService.findOne({ _id: context.id });
  },
};

const Mutation = {
  updateMyProfile: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.CUSTOMER]);
    const { data } = args;
    return await customerService.updateCustomer(context.id, data);
  },
  updateCustomer: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id, data } = args;
    return await customerService.updateOne(id, data).then((res) => {
      onActivity.next({
        userId: context.id,
        factorId: id,
        type: ActivityTypes.UPDATE,
        changedFactor: ChangedFactors.CUSTOMER,
      });
      return res;
    });
  },
  deleteOneCustomer: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id } = args;
    return await customerService.deleteOne(id).then((res) => {
      onActivity.next({
        userId: context.id,
        factorId: id,
        type: ActivityTypes.DELETE,
        changedFactor: ChangedFactors.CUSTOMER,
      });
      return res;
    });
  },
};

const Customer = {
  totalMiners: async (parent: { id: any; }) => {
    return MinerModel.countDocuments({customerId: parent.id});
  },
  totalTokensMined: async (parent: { id: any; }) => {
    const result = await MinerModel.aggregate([
      { $match: { customerId: parent.id } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalTokensMined' }
        }
      }
    ]);
    return result[0]?.total || 0;
  },
  totalUptime: async (parent: { id: any; }) => {
    const result = await MinerModel.aggregate([
      { $match: { customerId: parent.id } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalUptime' }
        }
      }
    ]);
    return result[0]?.total || 0;
  },
};
export default {
  Query,
  Mutation,
  Customer,
};
