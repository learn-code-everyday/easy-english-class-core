import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { orderService } from "./order.service";

const Query = {
  getAllOrder: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    return orderService.fetch(args.q);
  },
  getOneOrder: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await orderService.findOne({ _id: id });
  },
};

const Mutation = {
  createOrder: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    return await orderService.create(data);
  },
  updateOrder: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await orderService.updateOne(id, data);
  },
  deleteOneOrder: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await orderService.deleteOne(id);
  },
};

const Order = {
  
};

export default {
  Query,
  Mutation,
  Order,
};
