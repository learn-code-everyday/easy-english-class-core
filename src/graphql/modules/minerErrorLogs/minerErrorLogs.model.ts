import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export enum MinerErrorLogsStatuses {
    ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type MinerErrorLogs = {
  name?: string;
  status?: MinerErrorLogsStatuses;
};

const Schema = mongoose.Schema;

export type IMinerErrorLogs = BaseDocument & MinerErrorLogs;

const minerErrorLogsSchema = new Schema(
  {
    name: { type: String },
    status: { type: String, enum: MinerErrorLogsStatuses, default: MinerErrorLogsStatuses.ACTIVE },
  },
  { timestamps: true }
);

// minerErrorLogsSchema.index({ name: "text" }, { weights: { name: 2 } });

export const MinerErrorLogsHook = new ModelHook<IMinerErrorLogs>(minerErrorLogsSchema);
export const MinerErrorLogsModel: mongoose.Model<IMinerErrorLogs> = MainConnection.model(
  "MinerErrorLogs",
  minerErrorLogsSchema
);

export const MinerErrorLogsLoader = ModelLoader<IMinerErrorLogs>(MinerErrorLogsModel, MinerErrorLogsHook);
