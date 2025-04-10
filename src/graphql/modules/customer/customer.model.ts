import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
const Schema = mongoose.Schema;

export enum CustomerStatuses {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum CustomerGenders {
  MALE = "MALE",
  FEMALE = "FEMALE",
  UNKNOWN = "UNKNOWN",
}

export type Customer = {
  username?: string;
  activeAt?: Date;
  referralCode?: string;
  role?: string;
  addressIp?: string; // address
  avatarUrl?: string;

  displayName?: string;
  phoneNumber?: string;
  gender?: CustomerGenders;
  birthday?: Date;
  address?: string;

  district?: string;
  ward?: string;
  city?: string;

  slogan?: string;
  company?: string;
  club?: string;
  school?: string;
  bloodType?: string;
  citizenId?: string;
  gmail?: string


  status?: CustomerStatuses;

  };

export type ICustomer = BaseDocument & Customer;

const customerSchema = new Schema(
  {
    username: { type: String },
    activeAt: { type: Date },
    role: { type: String },
    addressIp: { type: String },
    avatarUrl: { type: String, default: "/images/customer/avatar.png" },
    gmail: { type: String },

    displayName: { type: String },
    phoneNumber: { type: String },
    gender: { type: String, enum: CustomerGenders },
    birthday: { type: Date },
    address: { type: String },

    district:{type: String},
    ward:{type: String},
    
    city: { type: String },

    slogan: { type: String },
    company: { type: String },
    club: { type: String },
    school: { type: String },
    bloodType: { type: String },
    citizenId: { type: String },


    referralCode: { type: String },
    referrenceId: { type: Schema.Types.ObjectId, ref: "Customer" },
    status: { type: String, enum: CustomerStatuses, default: CustomerStatuses.ACTIVE },
  },
  { timestamps: true }
);

customerSchema.index(
  { id: "text", address: "text", addressIp: "text" },
  { weights: { id: 1, address: 2, addressIp: 3 } }
);

export const CustomerHook = new ModelHook<ICustomer>(customerSchema);
export const CustomerModel: mongoose.Model<ICustomer> = MainConnection.model(
  "Customer",
  customerSchema
);

export const CustomerLoader = ModelLoader<ICustomer>(CustomerModel, CustomerHook);
