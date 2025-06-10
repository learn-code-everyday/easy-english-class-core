import { CrudService } from "../../../base/crudService";
import {UserModel} from "./user.model";
import mongoose from "mongoose";
import * as crypto from "crypto";
import {mailService} from "../../modules/mails/mails.service";
import {OtpModel} from "../../modules/otp/otp.model";


class UserService extends CrudService<typeof UserModel> {
  constructor() {
    super(UserModel);
  }

  async resetPassword(gmail: string) {
    const user = await UserModel.findOne({gmail});
    if (!user) {
      throw new Error("user not found.");
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const now = new Date();
    const expiredAt = new Date(now.getTime() + 10 * 60 * 1000);
    await OtpModel.create({
      userId: user._id,
      otp,
      sendAt: now.toISOString(),
      expiredAt: expiredAt.toISOString(),
    });

    await mailService.sendResetPassword({
      name: user.name,
      gmail: user.gmail,
      otp,
    });

    return { message: "OTP sent to email" };
  };


  async updatePassword(userId: string) {

  };

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
