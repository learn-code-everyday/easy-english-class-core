import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export type TokensHistory = {
  minerId?: string;
  tokenAmount?: number;
  transactionId?: string;
};

const Schema = mongoose.Schema;

export type ITokensHistory = BaseDocument & TokensHistory;

const tokensHistorySchema = new Schema(
  {
      minerId: { type: Schema.Types.ObjectId, ref: "Miner", required: true },
      tokenAmount: { type: Number, required: true },
      transactionId: { type: String },
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
