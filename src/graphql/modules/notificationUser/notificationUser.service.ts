import { CrudService } from "../../../base/crudService";
import { NotificationUserModel } from "./notificationUser.model";
class NotificationUserService extends CrudService<typeof NotificationUserModel> {
  constructor() {
    super(NotificationUserModel);
  }
}

const notificationUserService = new NotificationUserService();

export { notificationUserService };
