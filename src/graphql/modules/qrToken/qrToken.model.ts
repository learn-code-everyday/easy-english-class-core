import mongoose from "mongoose";
import {MainConnection} from "../../../loaders/database.loader";
import {BaseDocument, ModelLoader, ModelHook} from "../../../base/baseModel";

export enum QrTokenStatuses {
    UNUSED = "UNUSED",
    USED = "USED",
    REGISTERED = "REGISTERED",
    EXPIRED = "EXPIRED",
}

export type QrToken = {
    qrNumber?: string;
    token?: string;
    minerId?: string;
    orderId?: string;
    customerId?: string;
    qrCodeUrl?: string;
    isExport?: boolean;
    status?: QrTokenStatuses;
};

const Schema = mongoose.Schema;

export type IQrToken = BaseDocument & QrToken;

const qrTokenSchema = new Schema(
    {
        qrNumber: {type: String, unique: true, sparse: true},
        token: {type: String, unique: true, sparse: true},
        qrCodeUrl: {type: String},
        minerId: {type: Schema.Types.ObjectId, ref: "Miner"},
        orderId: {type: Schema.Types.ObjectId, ref: "Order"},
        customerId: {type: Schema.Types.ObjectId, ref: "Customer"},
        isExport: {type: Boolean, default: false},
        status: {type: String, enum: QrTokenStatuses, default: QrTokenStatuses.REGISTERED},
    },
    {timestamps: true}
);

// qrTokenSchema.index({ name: "text" }, { weights: { name: 2 } });

export const QrTokenHook = new ModelHook<IQrToken>(qrTokenSchema);
export const QrTokenModel: mongoose.Model<IQrToken> = MainConnection.model(
    "QrToken",
    qrTokenSchema
);

export const QrTokenLoader = ModelLoader<IQrToken>(QrTokenModel, QrTokenHook);
