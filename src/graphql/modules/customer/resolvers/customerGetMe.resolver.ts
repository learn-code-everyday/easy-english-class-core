import { ROLES } from "../../../../constants/role.const";
import { Context } from "../../../../core/context";
import { CustomerHelper } from "../customer.helper";

const Query = {
  customerGetMe: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.CUSTOMER]);
    const customer = await CustomerHelper.validContextAsCustomer(context.id);
    // await CustomerHelper.setAccessTimes(customer);
    return customer;
  },
};

export default {
  Query,
};
