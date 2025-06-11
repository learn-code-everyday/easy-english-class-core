import mongoose from "mongoose";
import {MainConnection} from "../../../loaders/database.loader";
import {BaseDocument, ModelLoader, ModelHook} from "../../../base/baseModel";

export enum OrderStatuses {
    PROCESSING = "PROCESSING",
    SUCCESS = "SUCCESS",
    PENDING_PAYMENT_CONFIRMATION = "PENDING_PAYMENT_CONFIRMATION",
    DUPLICATE_INFORMATION = "DUPLICATE_INFORMATION",
    PREVIOUSLY_REGISTERED = "PREVIOUSLY_REGISTERED",
    REJECTED = "REJECTED",
    MANUAL_PROCESSING = "MANUAL_PROCESSING",
    DELIVERING = "DELIVERING",
}

export enum OrderPaymentMethod {
    CRYPTO = "CRYPTO",
    CASH = "CASH",
    BANKING = "BANKING",
}

export type Order = {
    userId?: string;
    customerId?: string;
    fullname?: string;
    phone?: string;
    gmail?: string;
    address?: string;
    district?: string;
    ward?: string;
    city?: string;
    location?: string;
    paymentMethod?: OrderPaymentMethod;
    quantity?: number;
    amount?: number;
    trackingLink?: string;
    status?: OrderStatuses;
    rejectReason?: string;
    qrNumber?: any[];
    transactionImage?: [string];
    transactionInput?: string;
};

const Schema = mongoose.Schema;

export type IOrder = BaseDocument & Order;

const orderSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
        fullname: {type: String},
        phone: {type: String},
        gmail: {type: String},
        address: {type: String},
        district:{type: String},
        ward:{type: String},
        city: { type: String },
        location: { type: String },
        paymentMethod: {type: String, num: OrderPaymentMethod, default: OrderPaymentMethod.CASH},
        quantity: {type: Number},
        amount: {type: Number},
        status: {type: String, enum: OrderStatuses, default: OrderStatuses.PROCESSING},
        paymentDate: { type: Date },
        rejectReason: { type: String },
        trackingLink: { type: String },
        qrNumber: { type: [String] },
        transactionImage: { type: [String] },
        transactionInput: { type: String },
    },
    {timestamps: true}
);

orderSchema.index({ fullname: "text",  phone: "text", gmail: "text" });

export const OrderHook = new ModelHook<IOrder>(orderSchema);
export const OrderModel: mongoose.Model<IOrder> = MainConnection.model(
    "Order",
    orderSchema
);

export const OrderLoader = ModelLoader<IOrder>(OrderModel, OrderHook);
