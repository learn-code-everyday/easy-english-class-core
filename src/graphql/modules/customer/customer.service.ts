import { getGoogleProfile } from "@/core/google";
import { CrudService } from "../../../base/crudService";
import { Customer, CustomerModel, CustomerStatuses } from "./customer.model";
import { ErrorHelper } from "@/helpers";
import { onActivity } from "@/events/onActivity.event";
import { ActivityTypes, ChangedFactors } from "../activity/activity.model";
import { ROLES } from "@/constants/role.const";
import { CustomerHelper } from "./customer.helper";

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

      let customer = await CustomerModel.findOne({ email });

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
          email,
          googleId,
          firstname: name,
          referralCode: `Botanika-${Date.now()}`,
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
      const { referralCode, firstname, lastname, phoneNumber, address } = data;
      let customer = await CustomerModel.findById(customerId);

      if (customer) {
        return CustomerModel.findByIdAndUpdate(
          customerId,
          {
            $set: {
              referralCode: referralCode,
              firstname: firstname,
              lastname: lastname,
              phoneNumber: phoneNumber,
              address: address,
            },
          },
          { upsert: true, new: true },
        );
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      throw error; // Optionally rethrow the error to be handled upstream
    }
  }
}

const customerService = new CustomerService();

export { customerService };
