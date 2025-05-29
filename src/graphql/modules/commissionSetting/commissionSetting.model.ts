import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export enum CommissionSettingStatuses {
    ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type CommissionSetting = {
  name?: string;
  status?: CommissionSettingStatuses;
};

const Schema = mongoose.Schema;

export type ICommissionSetting = BaseDocument & CommissionSetting;

const commissionSettingSchema = new Schema(
  {
    name: { type: String },
    status: { type: String, enum: CommissionSettingStatuses, default: CommissionSettingStatuses.ACTIVE },
  },
  { timestamps: true }
);

// commissionSettingSchema.index({ name: "text" }, { weights: { name: 2 } });

export const CommissionSettingHook = new ModelHook<ICommissionSetting>(commissionSettingSchema);
export const CommissionSettingModel: mongoose.Model<ICommissionSetting> = MainConnection.model(
  "CommissionSetting",
  commissionSettingSchema
);

export const CommissionSettingLoader = ModelLoader<ICommissionSetting>(CommissionSettingModel, CommissionSettingHook);
