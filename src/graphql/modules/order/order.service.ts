import {CrudService} from "../../../base/crudService";
import {Order, OrderModel, OrderStatuses} from "./order.model";
import {CommissionsModel} from "../../modules/commissions/commissions.model";
import mongoose from "mongoose";
import {CustomerModel} from "../../modules/customer/customer.model";
import {SettingModel} from "../../modules/setting/setting.model";
import {SettingKey} from "../../../configs/settingData";

class OrderService extends CrudService<typeof OrderModel> {
  constructor() {
    super(OrderModel);
  }

  async getOrderForMerchant(userId: string, data: any) {
    try {

    } catch (error) {
      console.error("Error get order for merchant:", error);
      throw error;
    }
  }
  async createOrder(userId: string, data: any) {
    try {
      const { fullname, phone, gmail, address, paymentMethod, customerId, qrNumber} = data;
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
      const quantity = qrNumber.length || 0;
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
        qrNumber,
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
      data.customerId = existingOrder?.customerId
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
    data.amount = setting.value * quantity;
    await OrderModel.updateOne(
        { _id: id },
        { $set: data },
        { upsert: true, new: true },
    );

    return OrderModel.findById(id);
  }
  async approveOrder(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid order ID');
    }

    const existingOrder = await OrderModel.findById(id);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    if (existingOrder?.status !== OrderStatuses.PENDING_PAYMENT_CONFIRMATION) {
      throw new Error('Cannot update an order that is already PENDING_PAYMENT_CONFIRMATION');
    }

    const setting = await SettingModel.findOne({
      key: SettingKey.SELLER_COMMISSIONS_RATE,
    });

    if (!setting || isNaN(Number(setting.value))) {
      throw new Error("Miner unit price setting is missing or invalid.");
    }

    await OrderModel.updateOne(
        { _id: id },
        { $set: {
          status: OrderStatuses.DELIVERING
          } },
        { upsert: true, new: true },
    );

    await CommissionsModel.create({
      orderId: id,
      userId: existingOrder?.userId,
      commission: existingOrder?.amount * setting?.value / 100,
    });

    return OrderModel.findById(id);
  }
}

const orderService = new OrderService();

export { orderService };
