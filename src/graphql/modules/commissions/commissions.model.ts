import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export enum CommissionsStatuses {
    ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type Commissions = {
  name?: string;
  status?: CommissionsStatuses;
};

const Schema = mongoose.Schema;

export type ICommissions = BaseDocument & Commissions;

const commissionsSchema = new Schema(
  {
    name: { type: String },
    status: { type: String, enum: CommissionsStatuses, default: CommissionsStatuses.ACTIVE },
  },
  { timestamps: true }
);

// commissionsSchema.index({ name: "text" }, { weights: { name: 2 } });

export const CommissionsHook = new ModelHook<ICommissions>(commissionsSchema);
export const CommissionsModel: mongoose.Model<ICommissions> = MainConnection.model(
  "Commissions",
  commissionsSchema
);

export const CommissionsLoader = ModelLoader<ICommissions>(CommissionsModel, CommissionsHook);
