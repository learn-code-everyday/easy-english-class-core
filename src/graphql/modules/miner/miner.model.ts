import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export enum MinerStatuses {
    ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type Miner = {
  name?: string;
  model?: string;
  code?: string;
  status?: MinerStatuses;
  registered?: boolean;
  totalTokensMined?: number;
  totalUptime?: number;
  currentHashRate?: number;
  lastActive?: string;
  manufactureDate?: string;
  customerId?: string;
  connectedDate?: string;
};

const Schema = mongoose.Schema;

export type IMiner = BaseDocument & Miner;

const minerSchema = new Schema(
  {
    name: { type: String },
    model: { type: String },
    code: { type: String, unique: true },
    blockChainAddress: { type: String },
    status: { type: String, enum: MinerStatuses, default: MinerStatuses.ACTIVE },
    registered: { type: Boolean, default: false },
    totalTokensMined: { type: Number },
    totalUptime: { type: Number },
    currentHashRate: { type: Number },
    lastActive: { type: Date },
    manufactureDate: { type: Date },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    connectedDate: { type: Date },
  },
  { timestamps: true }
);

export const MinerHook = new ModelHook<IMiner>(minerSchema);
export const MinerModel: mongoose.Model<IMiner> = MainConnection.model(
  "Miner",
  minerSchema
);

export const MinerLoader = ModelLoader<IMiner>(MinerModel, MinerHook);
