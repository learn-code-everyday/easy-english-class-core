import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { commissionSettingService } from "./commissionSetting.service";

const Query = {
  getAllCommissionSetting: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    return commissionSettingService.fetch(args.q);
  },
  getOneCommissionSetting: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await commissionSettingService.findOne({ _id: id });
  },
};

const Mutation = {
  createCommissionSetting: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    return await commissionSettingService.create(data);
  },
  updateCommissionSetting: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await commissionSettingService.updateOne(id, data);
  },
  deleteOneCommissionSetting: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await commissionSettingService.deleteOne(id);
  },
};

const CommissionSetting = {
  
};

export default {
  Query,
  Mutation,
  CommissionSetting,
};
