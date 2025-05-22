import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { tokensHistoryService } from "./tokensHistory.service";

const Query = {
  getAllTokensHistory: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    return tokensHistoryService.fetch(args.q);
  },
  getOneTokensHistory: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { id } = args;
    return await tokensHistoryService.findOne({ _id: id });
  },
};

const Mutation = {
  createTokensHistory: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { data } = args;
    return await tokensHistoryService.create(data);
  },
  updateTokensHistory: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { id, data } = args;
    return await tokensHistoryService.updateOne(id, data);
  },
  deleteOneTokensHistory: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { id } = args;
    return await tokensHistoryService.deleteOne(id);
  },
};

const TokensHistory = {
  
};

export default {
  Query,
  Mutation,
  TokensHistory,
};
