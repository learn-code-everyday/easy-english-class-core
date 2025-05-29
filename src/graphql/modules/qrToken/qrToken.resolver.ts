import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { qrTokenService } from "./qrToken.service";

const Query = {
  getAllQrToken: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    return qrTokenService.fetch(args.q);
  },
  getOneQrToken: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await qrTokenService.findOne({ _id: id });
  },
};

const Mutation = {
  createQrToken: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    return await qrTokenService.create(data);
  },
  updateQrToken: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await qrTokenService.updateOne(id, data);
  },
  deleteOneQrToken: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await qrTokenService.deleteOne(id);
  },
};

const QrToken = {
  
};

export default {
  Query,
  Mutation,
  QrToken,
};
