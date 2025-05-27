import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export enum OrderStatuses {
    ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type Order = {
  name?: string;
  status?: OrderStatuses;
};

const Schema = mongoose.Schema;

export type IOrder = BaseDocument & Order;

const orderSchema = new Schema(
  {
    name: { type: String },
    status: { type: String, enum: OrderStatuses, default: OrderStatuses.ACTIVE },
  },
  { timestamps: true }
);

// orderSchema.index({ name: "text" }, { weights: { name: 2 } });

export const OrderHook = new ModelHook<IOrder>(orderSchema);
export const OrderModel: mongoose.Model<IOrder> = MainConnection.model(
  "Order",
  orderSchema
);

export const OrderLoader = ModelLoader<IOrder>(OrderModel, OrderHook);
