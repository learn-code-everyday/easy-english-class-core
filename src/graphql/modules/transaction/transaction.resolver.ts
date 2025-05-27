import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { transactionService } from "./transaction.service";

const Query = {
  getAllTransaction: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    return transactionService.fetch(args.q);
  },
  getOneTransaction: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await transactionService.findOne({ _id: id });
  },
};

const Mutation = {
  createTransaction: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    return await transactionService.create(data);
  },
  updateTransaction: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await transactionService.updateOne(id, data);
  },
  deleteOneTransaction: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await transactionService.deleteOne(id);
  },
};

const Transaction = {
  
};

export default {
  Query,
  Mutation,
  Transaction,
};
