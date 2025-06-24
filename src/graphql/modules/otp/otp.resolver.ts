import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { otpService } from "./otp.service";

const Query = {
  getAllOtp: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    return otpService.fetch(args.q);
  },
  getOneOtp: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id } = args;
    return await otpService.findOne({ _id: id });
  },
};

const Mutation = {
  createOtp: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { data } = args;
    return await otpService.create(data);
  },
  updateOtp: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id, data } = args;
    return await otpService.updateOne(id, data);
  },
  deleteOneOtp: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id } = args;
    return await otpService.deleteOne(id);
  },
};

const Otp = {
  
};

export default {
  Query,
  Mutation,
  Otp,
};
