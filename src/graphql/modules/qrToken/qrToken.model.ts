import mongoose from "mongoose";
import {MainConnection} from "../../../loaders/database.loader";
import {BaseDocument, ModelLoader, ModelHook} from "../../../base/baseModel";

export enum QrTokenStatuses {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export type QrToken = {
    token?: string;
    minerId?: string;
    customerId?: string;
    qrCodeUrl?: string;
    used?: boolean;
    status?: QrTokenStatuses;
};

const Schema = mongoose.Schema;

export type IQrToken = BaseDocument & QrToken;

const qrTokenSchema = new Schema(
    {
        token: {type: String},
        qrCodeUrl: {type: String},
        minerId: {type: Schema.Types.ObjectId, ref: "Miner"},
        customerId: {type: Schema.Types.ObjectId, ref: "Customer"},
        used: {type: Boolean, default: false},
        status: {type: String, enum: QrTokenStatuses, default: QrTokenStatuses.ACTIVE},
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
