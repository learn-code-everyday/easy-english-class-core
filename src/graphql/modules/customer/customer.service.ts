import { CrudService } from "../../../base/crudService";
import { Customer, CustomerModel, CustomerStatuses } from "./customer.model";
import { ErrorHelper } from "../../../core/error";
import { onActivity } from "../../../events/onActivity.event";
import { ActivityTypes, ChangedFactors } from "../../../graphql/modules/activity/activity.model";
import { CustomerHelper } from "../../../graphql/modules/customer/customer.helper";
import { getGoogleProfile } from "../../../core/google";
import { ROLES } from "../../../constants/role.const";

class CustomerService extends CrudService<typeof CustomerModel> {
  constructor() {
    super(CustomerModel);
  }

  async loginGoogle(token: string) {
    try {
      const infoGoogle = await getGoogleProfile(token);

      if (infoGoogle.error) {
        throw new Error("Invalid Google token or failed to fetch profile.");
      }

      const { email, googleId, name } = infoGoogle.data;

      let customer = await CustomerModel.findOne({ gmail: email });

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
          gmail: email,
          googleId,
          username: name,
          referralCode: `User-${Date.now()}`,
          activeAt: new Date(),
          role: ROLES.CUSTOMER,
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
    } catch (error) {
      console.error("Error during Google login:", error);
      throw error; // Optionally rethrow the error to be handled upstream
    }
  }
  async updateCustomer(customerId: string, data: any) {
    try {
      const { referralCode } = data;
      let customer = await CustomerModel.findById(customerId);

      if (customer) {
        return CustomerModel.findByIdAndUpdate(
            customerId,
            { $set: { referralCode: referralCode } },
            { upsert: true, new: true },
        )
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      throw error; // Optionally rethrow the error to be handled upstream
    }
  }
}

const customerService = new CustomerService();

export { customerService };
