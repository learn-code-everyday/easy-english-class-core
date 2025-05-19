import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { minerErrorLogsService } from "./minerErrorLogs.service";

const Query = {
  getAllMinerErrorLogs: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    return minerErrorLogsService.fetch(args.q);
  },
  getOneMinerErrorLogs: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await minerErrorLogsService.findOne({ _id: id });
  },
};

const Mutation = {
  createMinerErrorLogs: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    return await minerErrorLogsService.create(data);
  },
  updateMinerErrorLogs: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await minerErrorLogsService.updateOne(id, data);
  },
  deleteOneMinerErrorLogs: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await minerErrorLogsService.deleteOne(id);
  },
};

const MinerErrorLogs = {
  
};

export default {
  Query,
  Mutation,
  MinerErrorLogs,
};
