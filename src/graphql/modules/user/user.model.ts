import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
const Schema = mongoose.Schema;
export enum UserRoles {
  ADMIN = "ADMIN",
  MERCHANT = "MERCHANT",
  SALES = "SALES",
}

export enum UserStatuses {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type User = {
  name?: string;
  email?: string;
  phone?: string;
  wallet?: string;
  telegramLink?: string;
  password?: string;
  role?: UserRoles;
  avatar?: string;
  level?: number;
  lastLoginAt?: Date;
  status?: UserStatuses;
  isFirstLogin?: boolean;
  referralCode?: string;
  referrenceId?: mongoose.Types.ObjectId;
};

export type IUser = BaseDocument & User;

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    wallet: { type: String },
    telegramLink: { type: String },
    password: { type: String },
    level: { type: Number },
    role: { type: String, enum: Object.values(UserRoles) },
    avatar: { type: String },
    lastLoginAt: { type: Date },
    referralCode: { type: String, unique: true },
    referrenceId: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: Object.values(UserStatuses), default: UserStatuses.ACTIVE },
    isFirstLogin: { type: Boolean, default: false },
  },
  { timestamps: true, collation: { locale: "vi" } },
);

userSchema.index({ code: 1 });
userSchema.index({ email: "text" }, { weights: { email: 2 } });

export const UserHook = new ModelHook<IUser>(userSchema);
export const UserModel: mongoose.Model<IUser> = MainConnection.model("User", userSchema);

export const UserLoader = ModelLoader<IUser>(UserModel, UserHook);
