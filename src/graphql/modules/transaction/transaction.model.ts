import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export enum TransactionStatuses {
    PROCESSING = "PROCESSING",
    SUCCESS = "SUCCESS",
    PENDING_PAYMENT_CONFIRMATION = "PENDING_PAYMENT_CONFIRMATION",
    DUPLICATE_INFORMATION = "DUPLICATE_INFORMATION",
    PREVIOUSLY_REGISTERED = "PREVIOUSLY_REGISTERED",
    REJECTED = "REJECTED",
    MANUAL_PROCESSING = "MANUAL_PROCESSING",
}

export type Transaction = {
    orderId?: string;
    paymentDate?: Date;
    status?: TransactionStatuses;
};

const Schema = mongoose.Schema;

export type ITransaction = BaseDocument & Transaction;

const transactionSchema = new Schema(
  {
      orderId: { type: Schema.Types.ObjectId, ref: "Order" },
      paymentDate: { type: Date },
      status: { type: String, enum: TransactionStatuses, default: TransactionStatuses.PROCESSING },
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
