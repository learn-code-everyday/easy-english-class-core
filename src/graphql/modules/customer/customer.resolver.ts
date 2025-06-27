import { ROLES } from "../../../constants/role.const";
import { onActivity } from "../../../events/onActivity.event";
import { Context } from "../../../core/context";
import { customerService } from "./customer.service";
import { ActivityTypes, ChangedFactors } from "../activity/activity.model";

const Query = {
  getAllCustomer: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.CUSTOMER]);
    return customerService.fetch(args.q);
  },
  getOneCustomer: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id } = args;
    return await customerService.findOne({ _id: id });
  },
  getCustomerForAdmin: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN, ROLES.CUSTOMER]);
    const { email, referralCode } = args.data;
    return await customerService.findOne({ email, referralCode });
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

export default {
  Query,
  Mutation,
};
