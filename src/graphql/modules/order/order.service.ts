import {CrudService} from "../../../base/crudService";
import {Order, OrderModel, OrderStatuses} from "./order.model";
import {MinerModel, MinerStatuses} from "../../modules/miner/miner.model";
import {CommissionsModel} from "../../modules/commissions/commissions.model";
import mongoose from "mongoose";
import {qrTokenService} from "../qrToken/qrToken.service";
import {CustomerModel} from "../../modules/customer/customer.model";

class OrderService extends CrudService<typeof OrderModel> {
  constructor() {
    super(OrderModel);
  }

  async createOrder(buyerId: string, data: any) {
    try {
      const { fullname, phone, gmail, address, paymentMethod, quantity, customerId} = data;
      if (!customerId) {
        throw new Error("CustomerId not found.");
      }
      const customer = await CustomerModel.findById(customerId);
      if (!customer) {
        throw new Error("Customer not found.");
      }
      if (customer.gmail !== gmail) {
        throw new Error("Email does not match with customer record.");
      }
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
        customerId,
        fullname,
        phone,
        gmail,
        address,
        paymentMethod,
        quantity,
        amount,
      };

      return await OrderModel.create(dataInsert);
    } catch (error) {
      console.error("Error create order:", error);
      throw error;
    }
  }
  async updateOrder(id: string, data: any) {
    let {customerId, amount, status, quantity} = data;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid order ID');
    }

    const existingOrder = await OrderModel.findById(id);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    if(!customerId) {
      customerId = existingOrder?.customerId
    }
    console.log(99999, customerId)
    console.log(99999, existingOrder)

    if (existingOrder?.status == OrderStatuses.DELIVERING) {
      throw new Error('Cannot update an order that is already DELIVERING');
    }

    if(status == OrderStatuses.DELIVERING) {
      await CommissionsModel.create({
        orderId: id,
        buyerId: customerId,
        commission: amount * 30 / 100,
      });
      const minersToCreate = Array.from({ length: quantity }).map(() => ({
        name: `Miner-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        customerId: customerId,
        registered: true,
      }));
      const createdMiners =  await MinerModel.insertMany(minersToCreate);
      const createdMinerIds = createdMiners.map((m) => m._id.toString());
      const listQrUrl = await qrTokenService.generateMultipleQrCodes({customerId, minerIds: createdMinerIds})

      if(listQrUrl.length) {
        data.listQrUrl = listQrUrl;
      }
    }
    await OrderModel.updateOne(
        { _id: id },
        { $set: data },
        { upsert: true, new: true },
    );

    return OrderModel.findById(id);
  }
}

const orderService = new OrderService();

export { orderService };
