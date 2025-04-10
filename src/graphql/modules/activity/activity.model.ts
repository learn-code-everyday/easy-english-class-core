import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
const Schema = mongoose.Schema;

export enum ActivityTypes {
  ADMIN_SIGNING = "ADMIN_SIGNING",
  CUSTOMER_SIGNING = "CUSTOMER_SIGNING",
  CUSTOMER_REGISTER = "CUSTOMER_REGISTER",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  RESET = "RESET",
}

export enum ChangedFactors {
  USER = "USER",
  CUSTOMER = "CUSTOMER",
  SETTING = "SETTING",
  SETTING_GROUP = "SETTING_GROUP",
  JOBS = "JOBS",
}

export type Activity = {
  userId?: string;
  customerId?: string;
  factorId?: string;
  message?: string;
  type?: ActivityTypes;
  changedFactor?: ChangedFactors;
};

export type IActivity = BaseDocument & Activity;

const activitySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    factorId: { type: String },
    message: { type: String },
    type: { type: String, enum: ActivityTypes },
    changedFactor: { type: String, enum: ChangedFactors },
  },
  { timestamps: true, collation: { locale: "vi" } }
);

// activitySchema.index(
//   { weights: { username: 2, message: 4 } }
// );

export const ActivityHook = new ModelHook<IActivity>(activitySchema);
export const ActivityModel: mongoose.Model<IActivity> = MainConnection.model(
  "Activity",
  activitySchema
);

export const ActivityLoader = ModelLoader<IActivity>(ActivityModel, ActivityHook);
