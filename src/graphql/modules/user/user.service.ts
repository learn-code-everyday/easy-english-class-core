import { CrudService } from "../../../base/crudService";
import {UserModel} from "./user.model";
import mongoose from "mongoose";
import * as crypto from "crypto";
import {mailService} from "../../modules/mails/mails.service";
import {OtpModel, OtpStatuses} from "../../modules/otp/otp.model";
import {encryptionHelper} from "../../../helpers";
import md5 from "md5";

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

    return { success: true, message: "OTP sent to email" };
  };
  async verifyResetCode(gmail: string, otp: string) {
    const user = await UserModel.findOne({ gmail });
    if (!user) throw new Error("User not found");

    const now = new Date();

    const validOtp = await OtpModel.findOne({
      userId: user.id,
      otp,
      status: OtpStatuses.ACTIVE,
      expiredAt: { $gt: now.toISOString() },
    });

    if (!validOtp) throw new Error("Invalid or expired OTP");

    return { success: true, message: "OTP" };
  };
  async confirmPasswordReset(gmail: string, otp: string, newPassword: string) {
    const user = await UserModel.findOne({ gmail });
    if (!user) throw new Error("User not found");

    const now = new Date();

    const validOtp = await OtpModel.findOne({
      userId: user._id,
      otp,
      status: OtpStatuses.ACTIVE,
      expiredAt: { $gt: now.toISOString() },
    });

    if (!validOtp) throw new Error("Invalid or expired OTP");

    const hashedNewPassword = encryptionHelper.createPassword(md5(newPassword).toString(), String(user._id));
    await UserModel.updateOne({ _id: user._id }, { password: hashedNewPassword });

    validOtp.status = OtpStatuses.INACTIVE;
    await validOtp.save();

    return { success: true, message: "Pass" };
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
          referrals: 1,
          referredByChain: {
            $filter: {
              input: "$referredByChain",
              as: "user",
              cond: { $eq: ["$$user.role", "MERCHANT"] }
            }
          }
        }
      }
    ]);
    return result[0] ?? { referredByChain: [], referrals: [] };
  }
}

const userService = new UserService();

export { userService };
