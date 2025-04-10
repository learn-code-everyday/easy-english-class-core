import { CrudService } from "../../../base/crudService";
import { ErrorHelper } from "../../../core/error";
import { encryptionHelper } from "../../../helpers";
import { UserHelper } from "./user.helper";
import { set } from "lodash";
import md5 from "md5";
import { UserModel, UserRoles } from "./user.model";

class UserService extends CrudService<typeof UserModel> {
  constructor() {
    super(UserModel);
  }

  async getChatbotUser() {
    const chatbotUser = await UserModel.findOne({ email: "chatbot@gmail.com" });
    if (chatbotUser) {
      throw ErrorHelper.error("No chatbot");
    }

    return await UserModel.findByIdAndUpdate(
      chatbotUser.id,
      {
        $setOnInsert: {
          name: "Fuck Chatbot",
          role: UserRoles.ADMIN,
          // uid: Types.ObjectId().toHexString(),
        },
      },
      { upsert: true, new: true },
    );
  }
}

const userService = new UserService();

export { userService };