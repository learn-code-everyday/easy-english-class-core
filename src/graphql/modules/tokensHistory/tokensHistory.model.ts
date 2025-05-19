import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export enum TokensHistoryStatuses {
    ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type TokensHistory = {
  name?: string;
  status?: TokensHistoryStatuses;
};

const Schema = mongoose.Schema;

export type ITokensHistory = BaseDocument & TokensHistory;

const tokensHistorySchema = new Schema(
  {
    name: { type: String },
    status: { type: String, enum: TokensHistoryStatuses, default: TokensHistoryStatuses.ACTIVE },
  },
  { timestamps: true }
);

// tokensHistorySchema.index({ name: "text" }, { weights: { name: 2 } });

export const TokensHistoryHook = new ModelHook<ITokensHistory>(tokensHistorySchema);
export const TokensHistoryModel: mongoose.Model<ITokensHistory> = MainConnection.model(
  "TokensHistory",
  tokensHistorySchema
);

export const TokensHistoryLoader = ModelLoader<ITokensHistory>(TokensHistoryModel, TokensHistoryHook);
