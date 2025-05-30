import { CrudService } from "../../../base/crudService";
import {Order, OrderModel, OrderStatuses} from "./order.model";
import {MinerModel, MinerStatuses} from "../../modules/miner/miner.model";
import {CommissionsModel} from "../../modules/commissions/commissions.model";
import mongoose from "mongoose";
class OrderService extends CrudService<typeof OrderModel> {
  constructor() {
    super(OrderModel);
  }

  async createOrder(buyerId: string, data: any) {
    try {
      const {fullname, phone, email,address, paymentMethod, quantity} = data;
      const amount = 999 * quantity;
      const availableMiners = await MinerModel.find({
        status: MinerStatuses.ACTIVE,
        $or: [
          { customerId: { $exists: false } },
          { customerId: null }
        ]
      });
      if (availableMiners.length < quantity) {
        throw new Error("Insufficient miner.");
      }

      const dataInsert: Order = {
        sellerId: buyerId,
        fullname,
        phone,
        email,
        address,
        paymentMethod,
        quantity,
        amount,
      };

      return await OrderModel.create(dataInsert);
    } catch (error) {
      console.error("Error create order:", error);
      throw error; // Optionally rethrow the error to be handled upstream
    }
  }
  async updateOrder(id: string, data: any) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid order ID');
    }

    // Perform update
    const result = await OrderModel.updateOne(
        { _id: id },
        { $set: data },
        { upsert: true, new: true },
    );

    if (result.matchedCount === 0) {
      throw new Error('Order not found');
    }

    // Fetch and return the updated order
    const updatedOrder = await OrderModel.findById(id);
    return updatedOrder;
  }
}

const orderService = new OrderService();

export { orderService };
