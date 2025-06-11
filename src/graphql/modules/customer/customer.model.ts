import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
const Schema = mongoose.Schema;

export enum CustomerStatuses {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type Customer = {
  firstname?: string;
  lastname?: string;
  activeAt?: Date;
  referralCode?: string;
  role?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  address?: string;
  district?: string;
  ward?: string;
  city?: string;
  location?: string;
  gmail?: string
  googleId?: string
  status?: CustomerStatuses;

};

export type ICustomer = BaseDocument & Customer;

const customerSchema = new Schema(
  {
    firstname: { type: String },
    lastname: { type: String },
    activeAt: { type: Date },
    referralCode: { type: String, unique: true },
    referrenceId: { type: Schema.Types.ObjectId, ref: "Customer" },
    role: { type: String },
    avatarUrl: { type: String, default: "/images/customer/avatar.png" },
    gmail: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    district:{type: String},
    ward:{type: String},
    city: { type: String },
    location: { type: String },
    googleId: { type: String },
    status: { type: String, enum: CustomerStatuses, default: CustomerStatuses.ACTIVE },
  },
  { timestamps: true }
);

customerSchema.index({firstname: "text", lastname: "text", referralCode: "text", gmail: "text", phone: "text"}, {weights: {gmail: 2}});

export const CustomerHook = new ModelHook<ICustomer>(customerSchema);
export const CustomerModel: mongoose.Model<ICustomer> = MainConnection.model(
  "Customer",
  customerSchema
);

export const CustomerLoader = ModelLoader<ICustomer>(CustomerModel, CustomerHook);