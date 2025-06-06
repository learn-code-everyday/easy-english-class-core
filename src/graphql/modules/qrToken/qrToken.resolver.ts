import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { qrTokenService } from "./qrToken.service";
import {OrderModel} from "../../modules/order/order.model";
import {CustomerModel} from "../../modules/customer/customer.model";
import {MinerModel} from "../../modules/miner/miner.model";

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
  verifyQrToken: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { qrNumber } = args;
    const existingOrder = await OrderModel.findOne({ qrNumber: qrNumber });

    if (existingOrder) {
      throw new Error("QR number already used in an existing order.");
    }
    return await qrTokenService.findOne({ qrNumber });
  },
};

const Mutation = {
  generateMultipleQrCodes: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { quantity } = args;
    await qrTokenService.generateMultipleQrCodes(quantity);
    return qrTokenService.fetch(args.q);
  },
  exportQrToken: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { ids } = args;
    await qrTokenService.export(ids);
    return qrTokenService.fetch(args.q);
  },
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
  customer: async (parent: { customerId: any; }) => {
    return CustomerModel.findById(parent.customerId);
  },
  miner: async (parent: { minerId: any; }) => {
    return MinerModel.findById(parent.minerId);
  },
};

export default {
  Query,
  Mutation,
  QrToken,
};
