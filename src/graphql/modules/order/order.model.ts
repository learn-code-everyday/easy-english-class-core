import mongoose from "mongoose";
import {MainConnection} from "../../../loaders/database.loader";
import {BaseDocument, ModelLoader, ModelHook} from "../../../base/baseModel";

export enum OrderStatuses {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export enum OrderPaymentMethod {
    CRYPTO = "CRYPTO",
    CASH = "CASH",
    BANKING = "BANKING",
}

export type Order = {
    sellerId?: string;
    fullname?: string;
    phone?: string;
    email?: string;
    address?: string;
    paymentMethod?: OrderPaymentMethod;
    quantity?: number;
    amount?: number;
    status?: OrderPaymentMethod;
};

const Schema = mongoose.Schema;

export type IOrder = BaseDocument & Order;

const orderSchema = new Schema(
    {
        sellerId: { type: Schema.Types.ObjectId, ref: "Customer" },
        fullname: {type: String},
        phone: {type: String},
        email: {type: String},
        address: {type: String},
        paymentMethod: {type: String, num: OrderPaymentMethod, default: OrderPaymentMethod.CASH},
        quantity: {type: Number},
        amount: {type: Number},
        status: {type: String, enum: OrderStatuses, default: OrderStatuses.ACTIVE},
    },
    {timestamps: true}
);

// orderSchema.index({ name: "text" }, { weights: { name: 2 } });

export const OrderHook = new ModelHook<IOrder>(orderSchema);
export const OrderModel: mongoose.Model<IOrder> = MainConnection.model(
    "Order",
    orderSchema
);

export const OrderLoader = ModelLoader<IOrder>(OrderModel, OrderHook);
