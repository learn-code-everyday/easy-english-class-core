import { CrudService } from "../../../base/crudService";
import { CustomerModel } from "./customer.model";
class CustomerService extends CrudService<typeof CustomerModel> {
  constructor() {
    super(CustomerModel);
  }
}

const customerService = new CustomerService();

export { customerService };
