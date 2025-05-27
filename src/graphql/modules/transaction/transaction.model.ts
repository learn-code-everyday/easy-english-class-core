import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export enum TransactionStatuses {
    ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum PaymentMethods {
    CASH = "Cash",
    CARD = "Card",
}

export type Transaction = {
    sellerId?: string;
    amount?: number;
    currency?: string;
    reference?: string;
    paymentDate?: Date;
    paymentMethod?: PaymentMethods;
    location?: string;
    status?: TransactionStatuses;
};

const Schema = mongoose.Schema;

export type ITransaction = BaseDocument & Transaction;

const transactionSchema = new Schema(
  {
      sellerId: { type: Schema.Types.ObjectId, ref: "Customer" },
      amount: { type: Number },
      currency: { type: String },
      reference: { type: String },
      paymentDate: { type: Date },
      paymentMethod: { type: String, enum: PaymentMethods },
      location: { type: String },
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
