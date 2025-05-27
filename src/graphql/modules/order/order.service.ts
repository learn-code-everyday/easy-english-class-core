import { CrudService } from "../../../base/crudService";
import { OrderModel } from "./order.model";
class OrderService extends CrudService<typeof OrderModel> {
  constructor() {
    super(OrderModel);
  }
}

const orderService = new OrderService();

export { orderService };
