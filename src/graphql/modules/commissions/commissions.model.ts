import mongoose from "mongoose";
import {MainConnection} from "../../../loaders/database.loader";
import {BaseDocument, ModelLoader, ModelHook} from "../../../base/baseModel";

export enum CommissionsStatuses {
    PENDING = "PENDING",
    PAID = "PAID",
    REJECTED = "REJECTED",
}

export type Commissions = {
    orderId?: string;
    userId?: string;
    commission?: number;
    status?: CommissionsStatuses;
    paymentDate?: string;
};

const Schema = mongoose.Schema;

export type ICommissions = BaseDocument & Commissions;

const commissionsSchema = new Schema(
    {
        orderId: {type: Schema.Types.ObjectId, ref: "Order"},
        userId: {type: Schema.Types.ObjectId, ref: "User"},
        commission: { type: Number },
        status: {type: String, enum: CommissionsStatuses, default: CommissionsStatuses.PENDING},
        paymentDate: { type: Date },
    },
    {timestamps: true}
);

// commissionsSchema.index({ name: "text" }, { weights: { name: 2 } });

export const CommissionsHook = new ModelHook<ICommissions>(commissionsSchema);
export const CommissionsModel: mongoose.Model<ICommissions> = MainConnection.model(
    "Commissions",
    commissionsSchema
);

export const CommissionsLoader = ModelLoader<ICommissions>(CommissionsModel, CommissionsHook);
