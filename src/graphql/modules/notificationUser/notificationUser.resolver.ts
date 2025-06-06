import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { notificationUserService } from "./notificationUser.service";

const Query = {
  getAllNotificationUser: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
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
