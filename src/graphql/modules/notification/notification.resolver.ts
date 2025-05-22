import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { notificationService } from "./notification.service";
import {set} from "lodash";

const Query = {
  getAllNotification: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    if (context.isCustomer()) {
      set(args, "q.filter.customerId", context.id)
    }

    return notificationService.fetch(args.q);
  },
  getOneNotification: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { id } = args;
    return await notificationService.findOne({ _id: id });
  },
};

const Mutation = {
  createNotification: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { data } = args;
    return await notificationService.create(data);
  },
  updateNotification: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { id, data } = args;
    return await notificationService.updateOne(id, data);
  },
  deleteOneNotification: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { id } = args;
    return await notificationService.deleteOne(id);
  },
};

const Notification = {
  
};

export default {
  Query,
  Mutation,
  Notification,
};
