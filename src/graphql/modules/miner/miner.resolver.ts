import {ROLES} from "../../../constants/role.const";
import {Context} from "../../../core/context";
import {minerService} from "./miner.service";
import {set} from "lodash";
import {CustomerModel} from "../../modules/customer/customer.model";
import {qrTokenService} from "../../modules/qrToken/qrToken.service";
import {MinerModel, MinerStatuses} from "../../modules/miner/miner.model";
import {EmissionHelper} from "../../../helpers/emission.helper";

const Query = {
    getAllMiner: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_CUSTOMER);
        if (context.isCustomer()) {
            set(args, "q.filter.customerId", context.id);
        }
        return minerService.fetch(args.q);
    },
    getOneMiner: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_CUSTOMER);
        const {id} = args;
        const filter: any = {_id: id};
        if (context.isCustomer()) {
            set(filter, "customerId", context.id);
        }
        const miner = await minerService.findOne(filter);
        return miner;
    },
    getDataMinerForAdmin: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_MEMBER_EDITOR);
        return minerService.getDataMinerForAdmin();
    },
};

const Mutation = {
    scanMiner: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.CUSTOMER]);
        const {code} = args.data;
        const customerId = context.id;

        const dataQr = await qrTokenService.findOne({token: code, customerId});
        if (!dataQr) {
            throw new Error("Qr is missing or invalid.");
        }

        return minerService.generateMiner(customerId, code);
    },
    connectMiner: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.CUSTOMER]);
        const {data} = args;
        const {code} = data;

        const customerId = context.id;

        const miner = await minerService.findOne({code, customerId});
        if (!miner) {
            throw new Error("miner is missing or invalid.");
        }

        return await minerService.updateOne(miner.id, {
            registered: true,
            status: MinerStatuses.ACTIVE,
            connectedDate: new Date(),
        });
    },
    disConnectMiner: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
        const {data} = args;
        const {code} = data;
        const customerId = context.id;

        const miner: any = await minerService.findOne({code, customerId});
        if (!miner) {
            throw new Error("miner is missing or invalid.");
        }

        const now = new Date();
        const connectedDate = miner.connectedDate ? new Date(miner.connectedDate) : null;

        let uptimeInSeconds = 0;
        if (connectedDate) {
            uptimeInSeconds = (miner?.totalUptime || 0) + Math.floor((now.getTime() - connectedDate.getTime()) / 1000);
        }

        let finalEmission = miner.totalTokensMined || 0;
        if (miner.status === MinerStatuses.ACTIVE && connectedDate) {
            const earliestMiner = await MinerModel.findOne({status: MinerStatuses.ACTIVE})
                .select("connectedDate")
                .sort({connectedDate: 1})
                .lean();

            if (earliestMiner?.connectedDate) {
                const earliest = new Date(earliestMiner.connectedDate).getTime();
                const uptimeInDays = Math.floor((now.getTime() - earliest) / (1000 * 60 * 60 * 24)) || 1;
                const nodeCount = await MinerModel.countDocuments({status: MinerStatuses.ACTIVE});
                const position = await MinerModel.countDocuments({
                    registered: true,
                    status: MinerStatuses.ACTIVE,
                    connectedDate: {$lt: connectedDate},
                });
                const speedPerMiner = EmissionHelper.getRewardPerSecond(position, nodeCount, uptimeInDays) || 0;
                finalEmission += uptimeInSeconds * speedPerMiner;
            }
        }

        return await minerService.updateOne(miner._id.toString(), {
            status: MinerStatuses.INACTIVE,
            registered: false,
            totalUptime: (miner.totalUptime || 0) + uptimeInSeconds,
            totalTokensMined: finalEmission,
        });
    },
};

const Miner = {
    customer: async (parent: { customerId: any }) => {
        return CustomerModel.findById(parent.customerId);
    },
    totalUptime: async (parent: {
        id: any;
        customerId: any;
        connectedDate: any;
        totalUptime: any;
        status: any;
    }) => {
        let {connectedDate, status, totalUptime} = parent;

        // Nếu miner chưa bao giờ connect thì return 0
        if (!totalUptime && !connectedDate) {
            return 0;
        }

        let uptimeInSeconds = totalUptime || 0;

        // Nếu đang ACTIVE và có connectedDate, thêm uptime hiện tại
        if (status === MinerStatuses.ACTIVE && connectedDate) {
            const dateCheck = new Date(connectedDate);
            const now = new Date();
            const currentUptime = Math.floor((now.getTime() - dateCheck.getTime()) / 1000);
            uptimeInSeconds += currentUptime;
        }

        return uptimeInSeconds;
    },
    emission: async (parent: {
        id: any;
        customerId: any;
        connectedDate: any;
        status: any;
        totalTokensMined: any;
        totalUptime: any;
    }) => {
        let {id, customerId, connectedDate, totalUptime, status} = parent;
        if (!customerId || !connectedDate) {
            return {
                speedPerMiner: 0,
                totalEmission: 0
            }
        }
        const earliestMiner = await MinerModel.findOne({
            status: MinerStatuses.ACTIVE,
            connectedDate: { $exists: true, $ne: null }
        })
            .select('connectedDate')
            .sort({connectedDate: 1})
            .lean();

        if (!earliestMiner?.connectedDate) {
            return {
                speedPerMiner: 0,
                totalEmission: 0
            }
        }
        const earliest = new Date(earliestMiner.connectedDate).getTime();
        const today = Date.now();
        const uptimeInDays = Math.floor((today - earliest) / (1000 * 60 * 60 * 24)) || 1;
        const nodeCount = await MinerModel.countDocuments({status: MinerStatuses.ACTIVE});
        const position = await MinerModel.countDocuments({
            registered: true,
            status: MinerStatuses.ACTIVE,
            connectedDate: {$lt: connectedDate},
        });

        const speedPerMiner = EmissionHelper.getRewardPerSecond(position, nodeCount, uptimeInDays) || 0;
        const now = new Date();
        const dateCheck = new Date(connectedDate);
        let uptimeInSeconds = 0;
        if (dateCheck) {
            if (status === MinerStatuses.INACTIVE) {
                uptimeInSeconds = totalUptime;
            } else {
                uptimeInSeconds = (totalUptime || 0) + Math.floor((now.getTime() - dateCheck.getTime()) / 1000);
            }
        }

        return {
            speedPerMiner,
            totalEmission: uptimeInSeconds * speedPerMiner,
        }
    },
};

export default {
    Query,
    Mutation,
    Miner,
};
