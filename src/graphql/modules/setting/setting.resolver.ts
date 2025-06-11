import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { settingService } from "./setting.service";
import { GraphLoader } from "../../../core/loader";
import { SettingGroupLoader } from "../settingGroup/settingGroup.model";
import { set } from "lodash";
import { onActivity } from "../../../events/onActivity.event";
import { EditModes } from "./setting.model";
import { ActivityTypes, ChangedFactors } from "../activity/activity.model";

const Query = {
  getAllSetting: async (root: any, args: any, context: Context) => {
    if (context.isAdmin()) {
      set(args, "q.filter.isPrivate", false);
    }
    return settingService.fetch(args.q);
  },
  getOneSetting: async (root: any, args: any, context: Context) => {
    const { id } = args;
    return await settingService.findOne({ _id: id });
  },
  getOneSettingByKey: async (root: any, args: any, context: Context) => {
    const { key } = args;
    return await settingService.findOne({ key: key });
  },
};

const Mutation = {
  createSetting: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { data } = args;
    set(data, "editMode", EditModes.USER);
    return await settingService.create(data).then((res) => {
      onActivity.next({
        userId: context.id,
        factorId: res.id,
        type: ActivityTypes.CREATE,
        changedFactor: ChangedFactors.SETTING,
      });
      return res;
    });
  },
  updateSetting: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { id, data } = args;
    // console.log('data', data);
    return await settingService.updateOne(id, data).then((res) => {
      onActivity.next({
        userId: context.id,
        factorId: res.id,
        type: ActivityTypes.DELETE,
        changedFactor: ChangedFactors.SETTING,
      });
      return res;
    });
  },
  deleteOneSetting: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_MEMBER_EDITOR);
    const { id } = args;
    return await settingService.deleteOne(id).then((res) => {
      onActivity.next({
        userId: context.id,
        factorId: res.id,
        type: ActivityTypes.DELETE,
        changedFactor: ChangedFactors.SETTING,
      });
      return res;
    });
  },
  deleteManySetting: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_MEMBER_EDITOR);
    const { ids } = args;
    let result = await settingService.deleteMany(ids);
    return result;
  },
};

const Setting = {
  group: GraphLoader.loadById(SettingGroupLoader, "groupId"),
};

export default {
  Query,
  Mutation,
  Setting,
};
