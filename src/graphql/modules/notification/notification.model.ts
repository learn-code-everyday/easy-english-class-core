import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export enum NotificationStatuses {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type Notification = {
  title: string;
  description?: string;
  customerId: string;
  isRead: boolean;
  status?: NotificationStatuses;
};

const Schema = mongoose.Schema;

export type INotification = BaseDocument & Notification;

const notificationSchema = new Schema(
  {
      title: { type: String, required: true},
      description: { type: String },
      customerId: { type: Schema.Types.ObjectId, required: true, ref: "Customer" },
      isRead: { type: Boolean },
      status: { type: String, enum: NotificationStatuses, default: NotificationStatuses.ACTIVE },
  },
  { timestamps: true }
);

// notificationSchema.index({ name: "text" }, { weights: { name: 2 } });

export const NotificationHook = new ModelHook<INotification>(notificationSchema);
export const NotificationModel: mongoose.Model<INotification> = MainConnection.model(
  "Notification",
  notificationSchema
);

export const NotificationLoader = ModelLoader<INotification>(NotificationModel, NotificationHook);
