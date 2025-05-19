import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export enum MinerStatuses {
    ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type Miner = {
  name?: string;
  status?: MinerStatuses;
};

const Schema = mongoose.Schema;

export type IMiner = BaseDocument & Miner;

const minerSchema = new Schema(
  {
    name: { type: String },
    code: { type: String, unique: true },
    blockChainAddress: { type: String },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    status: { type: String, enum: MinerStatuses, default: MinerStatuses.ACTIVE },
    registered: { type: Boolean },
    totalTokensMined: { type: Number },
    totalUptime: { type: Number },
    currentHashRate: { type: Number },
    lastActive: { type: Date },
  },
  { timestamps: true }
);

// minerSchema.index({ name: "text" }, { weights: { name: 2 } });

export const MinerHook = new ModelHook<IMiner>(minerSchema);
export const MinerModel: mongoose.Model<IMiner> = MainConnection.model(
  "Miner",
  minerSchema
);

export const MinerLoader = ModelLoader<IMiner>(MinerModel, MinerHook);
