import {CrudService} from "../../../base/crudService";
import {CustomerModel} from "./customer.model";

class CustomerService extends CrudService<typeof CustomerModel> {
    constructor() {
        super(CustomerModel);
    }

    async updateCustomer(customerId: string, data: any) {
        try {
            const {referralCode, firstname, lastname, phoneNumber, address} = data;
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
                        }
                    },
                    {upsert: true, new: true},
                )
            }
        } catch (error) {
            console.error("Error during Google login:", error);
            throw error; // Optionally rethrow the error to be handled upstream
        }
    }
}

const customerService = new CustomerService();

export {customerService};
