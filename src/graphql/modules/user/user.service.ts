import { CrudService } from "../../../base/crudService";
import { ErrorHelper } from "../../../core/error";
import { UserModel, UserRoles } from "./user.model";
import mongoose from "mongoose";

class UserService extends CrudService<typeof UserModel> {
  constructor() {
    super(UserModel);
  }

  async getReferralTree(userId: string) {
    const result = await UserModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) }
      },
      {
        $graphLookup: {
          from: "users",
          startWith: "$referrenceId",
          connectFromField: "referrenceId",
          connectToField: "_id",
          as: "referredByChain"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "referrenceId",
          as: "referrals"
        }
      },
      {
        $project: {
          id: 1,
          name: 1,
          referredByChain: 1,
          referrals: 1
        }
      }
    ]);
    return result[0] ?? { referredByChain: [], referrals: [] };
  }
}

const userService = new UserService();

export { userService };
