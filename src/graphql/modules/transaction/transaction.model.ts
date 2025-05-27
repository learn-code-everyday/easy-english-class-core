import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export enum TransactionStatuses {
    ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type Transaction = {
  name?: string;
  status?: TransactionStatuses;
};

const Schema = mongoose.Schema;

export type ITransaction = BaseDocument & Transaction;

const transactionSchema = new Schema(
  {
    name: { type: String },
    status: { type: String, enum: TransactionStatuses, default: TransactionStatuses.ACTIVE },
  },
  { timestamps: true }
);

// transactionSchema.index({ name: "text" }, { weights: { name: 2 } });

export const TransactionHook = new ModelHook<ITransaction>(transactionSchema);
export const TransactionModel: mongoose.Model<ITransaction> = MainConnection.model(
  "Transaction",
  transactionSchema
);

export const TransactionLoader = ModelLoader<ITransaction>(TransactionModel, TransactionHook);
