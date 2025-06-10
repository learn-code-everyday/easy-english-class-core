import mongoose from "mongoose";
import {MainConnection} from "../../../loaders/database.loader";
import {BaseDocument, ModelLoader, ModelHook} from "../../../base/baseModel";

export enum OtpStatuses {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export type Otp = {
    userId?: string;
    otp?: string;
    sendAt?: Date;
    expiredAt?: Date;
    status?: OtpStatuses;
};

const Schema = mongoose.Schema;

export type IOtp = BaseDocument & Otp;

const otpSchema = new Schema(
    {
        userId: {type: Schema.Types.ObjectId, ref: "User"},
        otp: {type: String},
        sendAt: {type: String},
        expiredAt: {type: String},
        status: {type: String, enum: OtpStatuses, default: OtpStatuses.ACTIVE},
    },
    {timestamps: true}
);

// otpSchema.index({ name: "text" }, { weights: { name: 2 } });

export const OtpHook = new ModelHook<IOtp>(otpSchema);
export const OtpModel: mongoose.Model<IOtp> = MainConnection.model(
    "Otp",
    otpSchema
);

export const OtpLoader = ModelLoader<IOtp>(OtpModel, OtpHook);
