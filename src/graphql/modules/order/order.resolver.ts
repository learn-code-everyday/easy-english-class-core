import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { orderService } from "./order.service";
import {CustomerModel} from "../../modules/customer/customer.model";
import {set} from "lodash";

const Query = {
  getAllOrder: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    if (context.isMerchantOrSeller()) {
      set(args, "q.filter.userId", context.id)
    }
    return orderService.fetch(args.q);
  },
  getOneOrder: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    if (context.isMerchantOrSeller()) {
      set(args, "q.filter.userId", context.id)
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
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await orderService.updateOrder(id, data);
  },
  deleteOneOrder: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await orderService.deleteOne(id);
  },
};

const Order = {
  customer: async (parent: { customerId: any; }) => {
    return CustomerModel.findById(parent.customerId);
  },
};

export default {
  Query,
  Mutation,
  Order,
};
