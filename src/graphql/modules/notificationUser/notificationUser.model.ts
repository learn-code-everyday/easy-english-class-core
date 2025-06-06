import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export enum NotificationUserStatuses {
    ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type NotificationUser = {
    title: string;
    description?: string;
    userId: string;
    orderId: string;
    isRead: boolean;
    status?: NotificationUserStatuses;
};

const Schema = mongoose.Schema;

export type INotificationUser = BaseDocument & NotificationUser;

const notificationUserSchema = new Schema(
  {
      title: { type: String, required: true},
      description: { type: String },
      userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
      orderId: { type: Schema.Types.ObjectId, required: true, ref: "Order" },
      isRead: { type: Boolean },
      status: { type: String, enum: NotificationUserStatuses, default: NotificationUserStatuses.ACTIVE },
  },
  { timestamps: true }
);

// notificationUserSchema.index({ name: "text" }, { weights: { name: 2 } });

export const NotificationUserHook = new ModelHook<INotificationUser>(notificationUserSchema);
export const NotificationUserModel: mongoose.Model<INotificationUser> = MainConnection.model(
  "NotificationUser",
  notificationUserSchema
);

export const NotificationUserLoader = ModelLoader<INotificationUser>(NotificationUserModel, NotificationUserHook);
