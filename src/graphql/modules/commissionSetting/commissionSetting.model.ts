import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export enum CommissionSettingStatuses {
    ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type CommissionSetting = {
    isDefault?: boolean;
    status?: CommissionSettingStatuses;
    percentage?: number;
    maxAmount?: number;
    minAmount?: number;
    effectiveFrom?: Date;
    effectiveTo?: Date;
};

const Schema = mongoose.Schema;

export type ICommissionSetting = BaseDocument & CommissionSetting;

const commissionSettingSchema = new Schema(
  {
      isDefault: { type: Boolean },
      percentage: { type: Number },
      maxAmount: { type: Number },
      minAmount: { type: Number },
      effectiveFrom: { type: Date },
      effectiveTo: { type: Date },
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
