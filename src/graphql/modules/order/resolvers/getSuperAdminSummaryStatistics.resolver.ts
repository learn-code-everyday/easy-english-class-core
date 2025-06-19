import mongoose from "mongoose";
import { ROLES } from "../../../../constants/role.const";
import { Context } from "../../../../core/context";
import { OrderCurrency, OrderModel, OrderStatuses } from "../order.model";
import { CommissionsModel, CommissionsStatuses } from "../../commissions/commissions.model";
import { UserModel } from "../../user/user.model";

const Query = {
  getSuperAdminSummaryStatistics: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER]);

    const userId = context.id;
    
    try {
      // Validate userId
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId provided");
      }

      // Get all users under the super admin's branch (hierarchical)
      const subUsers = await UserModel.find({
        $or: [
          { referrenceId: new mongoose.Types.ObjectId(userId) }, // Users directly under
          { 
            referrenceId: { 
              $in: await UserModel.distinct('_id', { 
                referrenceId: new mongoose.Types.ObjectId(userId) 
              }) 
            } 
          } // Users indirectly under (level 2)
        ]
      }).select('_id');

      const userIds = [new mongoose.Types.ObjectId(userId), ...subUsers.map(u => u._id)];
      const [ordersAggregation, commissionsAggregation] = await Promise.all([
        OrderModel.aggregate([
          {
            $match: {
              userId: { $in: userIds },
              status: OrderStatuses.SUCCESS,
            },
          },
          {
            $group: {
              _id: "$currency",
              totalRevenue: { $sum: "$amount" },
              totalOrder: { $sum: "$quantity" },
            },
          },
        ]),
        CommissionsModel.aggregate([
          {
            $match: {
              userId: { $in: userIds },
              status: { $in: [CommissionsStatuses.PAID, CommissionsStatuses.PENDING] },
            },
          },
          {
            $group: {
              _id: "$status",
              totalCommission: { $sum: "$commission" },
            },
          },
        ]),
      ]);

      console.log("Orders aggregation result:", ordersAggregation);
      console.log("Commissions aggregation result:", commissionsAggregation);

      let totalUsdRevenue = 0;
      let totalUsdtRevenue = 0;
      let totalVndRevenue = 0;
      let totalOrder = 0;

      for (const record of ordersAggregation) {
        if (!record._id) continue; // Skip null currency records

        switch (record._id) {
          case OrderCurrency.USDT:
            totalUsdtRevenue += record.totalRevenue || 0;
            break;
          case OrderCurrency.USD:
            totalUsdRevenue += record.totalRevenue || 0;
            break;
          case OrderCurrency.VND:
            totalVndRevenue += record.totalRevenue || 0;
            break;
        }

        totalOrder += record.totalOrder || 0;
      }

      let totalPaidCommission = 0;
      let totalPendingCommission = 0;

      for (const commission of commissionsAggregation) {
        if (commission._id === CommissionsStatuses.PAID) {
          totalPaidCommission = commission.totalCommission || 0;
        } else if (commission._id === CommissionsStatuses.PENDING) {
          totalPendingCommission = commission.totalCommission || 0;
        }
      }

      return {
        totalUsdRevenue,
        totalUsdtRevenue,
        totalVndRevenue,
        totalOrder,
        totalPaidCommission,
        totalPendingCommission,
      };
    } catch (error) {
      console.error("Error getting super admin summary statistics:", error);
      throw error;
    }
  },
};

export default { Query };
