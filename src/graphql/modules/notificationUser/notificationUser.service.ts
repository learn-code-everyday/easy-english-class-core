import { CrudService } from "../../../base/crudService";
import { NotificationUserModel } from "./notificationUser.model";
import mongoose from "mongoose";
class NotificationUserService extends CrudService<typeof NotificationUserModel> {
  constructor() {
    super(NotificationUserModel);
  }

  async readNotification(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid notification ID");
    }

    const notification = await NotificationUserModel.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
    );

    if (!notification) {
      throw new Error("Notification not found");
    }

    return notification;
  }
}

const notificationUserService = new NotificationUserService();

export { notificationUserService };
