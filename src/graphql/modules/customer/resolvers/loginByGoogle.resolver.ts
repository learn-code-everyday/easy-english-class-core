import { ROLES } from "../../../../constants/role.const";
import { ErrorHelper } from "../../../../helpers";
import { Context } from "../../../../core/context";
import { CustomerHelper } from "../customer.helper";
import { onActivity } from "../../../../events/onActivity.event";
import { Customer, CustomerModel, CustomerStatuses } from "../customer.model";
import { ActivityTypes, ChangedFactors } from "../../activity/activity.model";

const Mutation = {
  loginByGoogle: async (root: any, args: any, context: Context) => {
    const { idToken } = args;

    const gmail = await CustomerHelper.getEmailByOAUTH2(idToken);

    let customer = await CustomerModel.findOne({ gmail });

    if (customer) {
      if (customer.status === CustomerStatuses.INACTIVE) {
        throw ErrorHelper.permissionDeny();
      }

      onActivity.next({
        customerId: customer.id,
        factorId: customer.id,
        type: ActivityTypes.CUSTOMER_SIGNING,
        changedFactor: ChangedFactors.CUSTOMER,
      });
    } else {
      const data: Customer = {
        gmail,
        activeAt: new Date(),
        role: ROLES.CUSTOMER,
        referralCode: await CustomerHelper.generateReferralCode(gmail),
      };

      customer = await CustomerModel.create(data);

      onActivity.next({
        customerId: customer.id,
        factorId: customer.id,
        type: ActivityTypes.CUSTOMER_REGISTER,
        changedFactor: ChangedFactors.CUSTOMER,
      });
    }

    return {
      customer,
      token: new CustomerHelper(customer).getToken(),
    };
  },
};

export default { Mutation };

// (async () => {

// })();
