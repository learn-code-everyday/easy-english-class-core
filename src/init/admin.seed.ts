import { User, UserModel, UserRoles, UserStatuses } from "../graphql/modules/user/user.model";
import { UserHelper } from "../graphql/modules/user/user.helper";
import { encryptionHelper } from "../helpers";
import { set } from "lodash";
import md5 from "md5";

export const seedingAdmin = async () => {
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    const myUsername = process.env.ADMIN_USERNAME;
    const myPassword = process.env.ADMIN_PASSWORD;
    await UserModel.deleteMany({});
    // const user: User = {
    //   // code: await UserHelper.generateCode(),
    //   name: "Admin",
    //   gmail: myUsername,
    //   role: UserRoles.ADMIN,
    //   status: UserStatuses.ACTIVE,
    // };

    // const userCreating = new UserModel(user);
    // const password = md5(myPassword).toString();

    // const hashPassword = encryptionHelper.createPassword(password, userCreating.id);
    // set(userCreating, "password", hashPassword);

    // await userCreating.save().then(() => {
    //   console.log("🚣 Admin created");
    // });
  }
}