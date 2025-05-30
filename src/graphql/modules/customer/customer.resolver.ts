import {ROLES} from "../../../constants/role.const";
import {onActivity} from "../../../events/onActivity.event";
import {Context} from "../../../core/context";
import {customerService} from "./customer.service";
import {ActivityTypes, ChangedFactors} from "../activity/activity.model";
import {MinerModel} from "../../modules/miner/miner.model";

const Query = {
  getAllCustomer: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
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
