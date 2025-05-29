import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export enum QrTokenStatuses {
    ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type QrToken = {
  name?: string;
  status?: QrTokenStatuses;
};

const Schema = mongoose.Schema;

export type IQrToken = BaseDocument & QrToken;

const qrTokenSchema = new Schema(
  {
    name: { type: String },
    status: { type: String, enum: QrTokenStatuses, default: QrTokenStatuses.ACTIVE },
  },
  { timestamps: true }
);

// qrTokenSchema.index({ name: "text" }, { weights: { name: 2 } });

export const QrTokenHook = new ModelHook<IQrToken>(qrTokenSchema);
export const QrTokenModel: mongoose.Model<IQrToken> = MainConnection.model(
  "QrToken",
  qrTokenSchema
);

export const QrTokenLoader = ModelLoader<IQrToken>(QrTokenModel, QrTokenHook);
