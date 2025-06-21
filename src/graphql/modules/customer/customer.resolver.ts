import { ROLES } from "../../../constants/role.const";
import { onActivity } from "../../../events/onActivity.event";
import { Context } from "../../../core/context";
import { customerService } from "./customer.service";
import { ActivityTypes, ChangedFactors } from "../activity/activity.model";
import { MinerModel, MinerStatuses } from "../../modules/miner/miner.model";
import { UserModel } from "../../modules/user/user.model";
import { OrderModel } from "../../modules/order/order.model";
import { set } from "lodash";
import { EmissionHelper } from "../../../helpers/emission.helper";

const Query = {
  getAllCustomer: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    if (context.isMerchantOrSeller()) {
      // Get customers from orders created by this user
      const orders = await OrderModel.find({ userId: context.id }).select("customerId");
      const customerIds = orders.map(order => order.customerId).filter(Boolean);
      if (customerIds.length > 0) {
        set(args, "q.filter._id.$in", customerIds);
      } else {
        // No orders = no customers to show
        set(args, "q.filter._id.$in", []);
      }
    } else if (context.isSuperAdmin()) {
      // Filter customers for users in the same branch based on referenceId
      const currentUser = await UserModel.findById(context.id);
      if (currentUser && currentUser.referrenceId) {
        // Get all users in the same branch (descendants)
        const branchUsers = await UserModel.find({
          referrenceId: currentUser.id
        }).select("_id");

        const branchUserIds = branchUsers.map((user) => user._id);

        // Get customers from orders created by users in the branch
        const orders = await OrderModel.find({
          userId: { $in: branchUserIds }
        }).select("customerId");
        const customerIds = orders.map(order => order.customerId).filter(Boolean);

        if (customerIds.length > 0) {
          set(args, "q.filter._id.$in", customerIds);
        } else {
          // No orders = no customers to show
          set(args, "q.filter._id.$in", []);
        }
      }
    }
    return customerService.fetch(args.q);
  },
  getOneCustomer: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id } = args;
    return await customerService.findOne({ _id: id });
  },
  getCustomerForAdmin: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { gmail, referralCode } = args.data;
    return await customerService.findOne({ gmail, referralCode });
  },
  customerGetMe: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.CUSTOMER]);
    return await customerService.findOne({ _id: context.id });
  },
};

const Mutation = {
  updateMyProfile: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.CUSTOMER]);
    const { data } = args;
    return await customerService.updateCustomer(context.id, data);
  },
  updateCustomer: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id, data } = args;
    return await customerService.updateOne(id, data).then((res) => {
      onActivity.next({
        userId: context.id,
        factorId: id,
        type: ActivityTypes.UPDATE,
        changedFactor: ChangedFactors.CUSTOMER,
      });
      return res;
    });
  },
  deleteOneCustomer: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id } = args;
    return await customerService.deleteOne(id).then((res) => {
      onActivity.next({
        userId: context.id,
        factorId: id,
        type: ActivityTypes.DELETE,
        changedFactor: ChangedFactors.CUSTOMER,
      });
      return res;
    });
  },
};

const Customer = {
  emission: async (parent: { id: any }) => {
    const miners = await MinerModel.find({ customerId: parent.id, status: MinerStatuses.ACTIVE }).lean();

    let totalEmission = 0;
    const now = Date.now();
    let speedPerMiner = 0;
    let totalSpeedAllMiner = 0;

    // Lấy earliestMiner một lần cho toàn bộ, chỉ lấy miners có connectedDate
    const earliestMiner = await MinerModel.findOne({ 
      status: MinerStatuses.ACTIVE,
      connectedDate: { $exists: true, $ne: null }
    })
      .select('connectedDate')
      .sort({ connectedDate: 1 })
      .lean();

    if (!earliestMiner?.connectedDate) {
      return {
        speedPerMiner: 0,
        totalSpeedAllMiner: 0,
        totalEmission: 0,
      };
    }

    const earliest = new Date(earliestMiner.connectedDate).getTime();
    const uptimeInDays = Math.floor((now - earliest) / (1000 * 60 * 60 * 24)) || 1;
    const nodeCount = await MinerModel.countDocuments({ status: MinerStatuses.ACTIVE });

    for (const miner of miners) {
      const { connectedDate, registered } = miner;
      if (!connectedDate) continue;

      const position = await MinerModel.countDocuments({
        registered: true,
        status: MinerStatuses.ACTIVE,
        connectedDate: { $lt: connectedDate },
      });

      speedPerMiner = EmissionHelper.getRewardPerSecond(position, nodeCount, uptimeInDays) || 0;
      totalSpeedAllMiner += speedPerMiner;

      const uptimeInSeconds = Math.floor((now - new Date(connectedDate).getTime()) / 1000);
      const minerEmission = uptimeInSeconds * speedPerMiner;
      totalEmission += minerEmission;
    }

    return {
      speedPerMiner,
      totalSpeedAllMiner,
      totalEmission,
    };
  },

  totalUptime: async (parent: { id: any }) => {
    const miners = await MinerModel.find({ customerId: parent.id, status: MinerStatuses.ACTIVE }).lean();
    const now = Date.now();

    let total = 0;
    for (const miner of miners) {
      const uptimeBefore = miner.totalUptime || 0;
      let extraUptime = 0;

      if (miner.connectedDate && miner.status === MinerStatuses.ACTIVE) {
        const connectedDate = new Date(miner.connectedDate).getTime();
        extraUptime = Math.floor((now - connectedDate) / 1000);
      }

      total += uptimeBefore + extraUptime;
    }

    return total;
  },
  totalMiners: async (parent: { id: any; }) => {
    return MinerModel.countDocuments({ customerId: parent.id });
  },
  totalTokensMined: async (parent: { id: any; }) => {
    const result = await MinerModel.aggregate([
      { $match: { customerId: parent.id } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalTokensMined' }
        }
      }
    ]);
    return result[0]?.total || 0;
  },
};
export default {
  Query,
  Mutation,
  Customer,
};
