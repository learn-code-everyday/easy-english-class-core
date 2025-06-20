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
  totalEmission?: number;
  totalUptime?: number;
  currentHashRate?: number;
  lastActive?: string;
  lastEmissionUpdate?: string;
  manufactureDate?: string;
  customerId?: string;
  connectedDate?: string;
  amount?: number;
};

const Schema = mongoose.Schema;

export type IMiner = BaseDocument & Miner;

const minerSchema = new Schema(
  {
    name: { type: String },
    model: { type: String },
    code: { type: String, unique: true, sparse: true },
    blockChainAddress: { type: String },
    status: { type: String, enum: MinerStatuses, default: MinerStatuses.INACTIVE },
    registered: { type: Boolean, default: false },
    totalTokensMined: { type: Number },
    totalEmission: { type: Number, default: 0 },
    totalUptime: { type: Number },
    currentHashRate: { type: Number },
    lastActive: { type: Date },
    lastEmissionUpdate: { type: Date },
    manufactureDate: { type: Date },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    connectedDate: { type: Date },
    amount: { type: Number },
  },
  { timestamps: true }
);

minerSchema.index({ connectedDate: 1 });

export const MinerHook = new ModelHook<IMiner>(minerSchema);
export const MinerModel: mongoose.Model<IMiner> = MainConnection.model(
  "Miner",
  minerSchema
);

export const MinerLoader = ModelLoader<IMiner>(MinerModel, MinerHook);
