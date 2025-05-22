import mongoose from "mongoose";
import {MainConnection} from "../../../loaders/database.loader";
import {BaseDocument, ModelLoader, ModelHook} from "../../../base/baseModel";

export enum ErrorSeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL",
}

export type MinerErrorLogs = {
    minerId: mongoose.Types.ObjectId;
    errorCode?: string;
    errorMessage: string;
    severity?: ErrorSeverity;
};

const Schema = mongoose.Schema;

export type IMinerErrorLogs = BaseDocument & MinerErrorLogs;

const minerErrorLogsSchema = new Schema(
    {
        minerId: {type: Schema.Types.ObjectId, ref: "Miner", required: true},
        errorCode: {type: String},
        errorMessage: {type: String, required: true},
        severity: {type: String, enum: ErrorSeverity, default: ErrorSeverity.LOW},
    },
    {timestamps: true}
);

// minerErrorLogsSchema.index({ name: "text" }, { weights: { name: 2 } });

export const MinerErrorLogsHook = new ModelHook<IMinerErrorLogs>(minerErrorLogsSchema);
export const MinerErrorLogsModel: mongoose.Model<IMinerErrorLogs> = MainConnection.model(
    "MinerErrorLogs",
    minerErrorLogsSchema
);

export const MinerErrorLogsLoader = ModelLoader<IMinerErrorLogs>(MinerErrorLogsModel, MinerErrorLogsHook);
