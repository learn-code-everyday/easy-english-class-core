import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { commissionsService } from "./commissions.service";
import {UserModel} from "../../modules/user/user.model";
import {OrderModel} from "../../modules/order/order.model";

const Query = {
  getAllCommissions: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    return commissionsService.fetch(args.q);
  },
  getOneCommissions: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
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
    context.auth(ROLES.ADMIN_EDITOR);
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
