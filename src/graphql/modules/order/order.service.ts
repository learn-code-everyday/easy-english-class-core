import {CrudService} from "../../../base/crudService";
import {Order, OrderModel, OrderStatuses} from "./order.model";
import {MinerModel, MinerStatuses} from "../../modules/miner/miner.model";
import {CommissionsModel} from "../../modules/commissions/commissions.model";
import mongoose from "mongoose";
import {qrTokenService} from "../qrToken/qrToken.service";
import {CustomerModel} from "../../modules/customer/customer.model";
import {SettingModel} from "../../modules/setting/setting.model";
import {SettingKey} from "../../../configs/settingData";

class OrderService extends CrudService<typeof OrderModel> {
  constructor() {
    super(OrderModel);
  }

  async createOrder(userId: string, data: any) {
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
      const setting = await SettingModel.findOne({
        key: SettingKey.MINER_UNIT_PRICE,
      });

      if (!setting || isNaN(Number(setting.value))) {
        throw new Error("Miner unit price setting is missing or invalid.");
      }
      const amount = setting.value * quantity;
      const dataInsert: Order = {
        userId,
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
    let {customerId, status, quantity} = data;
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

    if(!quantity) {
      quantity = existingOrder?.quantity
    }

    if (existingOrder?.status == OrderStatuses.DELIVERING) {
      throw new Error('Cannot update an order that is already DELIVERING');
    }

    const setting = await SettingModel.findOne({
      key: SettingKey.MINER_UNIT_PRICE,
    });

    if (!setting || isNaN(Number(setting.value))) {
      throw new Error("Miner unit price setting is missing or invalid.");
    }
    const amount = setting.value * quantity;
    data.amount = amount;
    if(status == OrderStatuses.DELIVERING) {
      await CommissionsModel.create({
        orderId: id,
        userId: customerId,
        commission: amount * 30 / 100,
      });
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
