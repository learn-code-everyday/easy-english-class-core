import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { notificationUserService } from "./notificationUser.service";
import {set} from "lodash";

const Query = {
  getAllNotificationUser: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    if (context.isCustomer()) {
      set(args, "q.filter.userId", context.id)
    }
    return notificationUserService.fetch(args.q);
  },
  getOneNotificationUser: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await notificationUserService.findOne({ _id: id });
  },
};

const Mutation = {
  createNotificationUser: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    return await notificationUserService.create(data);
  },
  updateNotificationUser: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await notificationUserService.updateOne(id, data);
  },
  readNotificationUser: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await notificationUserService.readNotification(id);
  },
  deleteOneNotificationUser: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await notificationUserService.deleteOne(id);
  },
};

const NotificationUser = {
  
};

export default {
  Query,
  Mutation,
  NotificationUser,
};
