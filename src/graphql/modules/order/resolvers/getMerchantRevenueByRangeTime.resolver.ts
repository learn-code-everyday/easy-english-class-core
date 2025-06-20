import mongoose from "mongoose";
import { ROLES } from "../../../../constants/role.const";
import { Context } from "../../../../core/context";
import { OrderModel, OrderStatuses, OrderCurrency } from "../order.model";

// Currency conversion rates (you can make this dynamic by fetching from API)
const CURRENCY_RATES = {
  USDT: 1,        // Base currency
  USD: 1,         // Assuming 1 USD = 1 USDT (adjust as needed)
  VND: 0.00004,   // Assuming 1 VND = 0.00004 USDT (adjust as needed)
};

const convertToUSDT = (amount: number, currency: string): number => {
  const rate = CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES] || 1;
  return amount * rate;
};

const Query = {
  getMerchantRevenueByRangeTime: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MERCHANT]);

    const userId = context.id;

    const { fromDate, toDate } = args;

    try {
      // Validate userId
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId provided");
      }

      const userObjectId = new mongoose.Types.ObjectId(userId);

      // Build date filter
      const dateFilter: any = { $exists: true, $ne: null };
      let fromDateObj: Date, toDateObj: Date;

      if (fromDate && toDate) {
        fromDateObj = new Date(fromDate);
        toDateObj = new Date(toDate);

        // Set time to start and end of day
        fromDateObj.setHours(0, 0, 0, 0);
        toDateObj.setHours(23, 59, 59, 999);

        dateFilter.$gte = fromDateObj;
        dateFilter.$lte = toDateObj;
      } else {
        // Default to current month if no dates provided
        const now = new Date();
        fromDateObj = new Date(now.getFullYear(), now.getMonth(), 1);
        toDateObj = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        dateFilter.$gte = fromDateObj;
        dateFilter.$lte = toDateObj;
      }

      // Calculate time difference to determine grouping strategy
      const timeDiff = toDateObj.getTime() - fromDateObj.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      let groupBy: any;
      let timeFormat: string;

      if (daysDiff <= 31) {
        // 1 month or less: group by day
        groupBy = {
          year: { $year: "$paymentDate" },
          month: { $month: "$paymentDate" },
          day: { $dayOfMonth: "$paymentDate" },
        };
        timeFormat = "day";
      } else if (daysDiff <= 93) {
        // 1-3 months: group by week
        groupBy = {
          year: { $year: "$paymentDate" },
          week: { $week: "$paymentDate" },
        };
        timeFormat = "week";
      } else {
        // More than 3 months: group by month
        groupBy = {
          year: { $year: "$paymentDate" },
          month: { $month: "$paymentDate" },
        };
        timeFormat = "month";
      }

      const revenueByTime = await OrderModel.aggregate([
        {
          $match: {
            userId: userObjectId,
            status: OrderStatuses.SUCCESS,
            paymentDate: dateFilter,
          },
        },
        {
          $group: {
            _id: {
              ...groupBy,
              currency: "$currency", // Group by currency as well
            },
            value: { $sum: "$amount" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
            "_id.week": 1,
            "_id.day": 1,
          },
        },
      ]);

      // Format the response based on time format
      let revenueData: any[] = [];

      if (timeFormat === "day") {
        // Generate day-based data
        const current = new Date(fromDateObj.getTime()); // Create a proper copy
        revenueData = [];
        
        while (current <= toDateObj) {
          const dateStr = `${current.getDate().toString().padStart(2, "0")}/${(current.getMonth() + 1).toString().padStart(2, "0")}`;
          revenueData.push({ time: dateStr, value: 0 });
          current.setDate(current.getDate() + 1);
        }

        // Fill in actual values
        for (const item of revenueByTime) {
          if (item._id) {
            const dateStr = `${item._id.day.toString().padStart(2, "0")}/${item._id.month.toString().padStart(2, "0")}`;
            const found = revenueData.find((d) => d.time === dateStr);
            if (found) {
              // Convert currency to USDT before adding
              const convertedValue = convertToUSDT(item.value || 0, item._id.currency || 'USDT');
              found.value += convertedValue;
            }
          }
        }
      } else if (timeFormat === "week") {
        // Generate week-based data for the entire date range
        const current = new Date(fromDateObj.getTime()); // Create a proper copy
        const weeks = new Set();
        
        while (current <= toDateObj) {
          const year = current.getFullYear();
          const startOfYear = new Date(year, 0, 1);
          const dayOfYear = Math.floor((current.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
          const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
          weeks.add(`W${weekNumber}/${year}`);
          current.setDate(current.getDate() + 7);
        }

        revenueData = Array.from(weeks)
          .sort()
          .map((week) => ({ time: week, value: 0 }));

        // Fill in actual values
        for (const item of revenueByTime) {
          if (item._id) {
            const weekStr = `W${item._id.week}/${item._id.year}`;
            const found = revenueData.find((d) => d.time === weekStr);
            if (found) {
              // Convert currency to USDT before adding
              const convertedValue = convertToUSDT(item.value || 0, item._id.currency || 'USDT');
              found.value += convertedValue;
            }
          }
        }
      } else {
        // Generate month-based data for the entire date range
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        
        const current = new Date(fromDateObj.getFullYear(), fromDateObj.getMonth(), 1);
        revenueData = [];
        
        while (current <= toDateObj) {
          const monthStr = `${monthNames[current.getMonth()]} ${current.getFullYear()}`;
          revenueData.push({ time: monthStr, value: 0 });
          current.setMonth(current.getMonth() + 1);
        }

        // Fill in actual values
        for (const item of revenueByTime) {
          if (item._id) {
            const monthStr = `${monthNames[item._id.month - 1]} ${item._id.year}`;
            const found = revenueData.find((d) => d.time === monthStr);
            if (found) {
              // Convert currency to USDT before adding
              const convertedValue = convertToUSDT(item.value || 0, item._id.currency || 'USDT');
              found.value += convertedValue;
            }
          }
        }
      }

      return {
        revenueData,
        timeFormat,
        dateRange: {
          from: fromDate || fromDateObj.toISOString().split("T")[0],
          to: toDate || toDateObj.toISOString().split("T")[0],
        },
      };
    } catch (error) {
      console.error("Error getting merchant revenue by range time:", error);
      throw error;
    }
  },
};

export default { Query };
