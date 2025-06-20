import {ROLES} from "../../../constants/role.const";
import {Context} from "../../../core/context";
import {minerService} from "./miner.service";
import {set} from "lodash";
import {CustomerModel} from "../../modules/customer/customer.model";
import {qrTokenService} from "../../modules/qrToken/qrToken.service";
import {MinerModel, MinerStatuses} from "../../modules/miner/miner.model";
import {EmissionHelper} from "../../../helpers/emission.helper";

const Query = {
    getMyMiner: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.CUSTOMER]);
        if (context.isCustomer()) {
            set(args, "q.filter.customerId", context.id)
        }
        return minerService.fetch(args.q);
    },
    getAllMiner: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
        return minerService.fetch(args.q);
    },
    getOneMiner: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
        const {id} = args;
        return await minerService.findOne({_id: id});
    },
    getDataMinerForAdmin: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_MEMBER_EDITOR);
        return minerService.getDataMinerForAdmin();
    },
};

const Mutation = {
    scanMiner: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
        const {code} = args.data;
        const customerId = context.id;

        const dataQr = await qrTokenService.findOne({token: code, customerId});
        if (!dataQr) {
            throw new Error("Qr is missing or invalid.");
        }

        return minerService.generateMiner(customerId, code);
    },
    connectMiner: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
        const {data} = args;
        const {code} = data;

        const miner: any = await minerService.findOne({code})
        if (!miner || miner?.customerId !== context.id) {
            throw new Error("miner is missing or invalid.");
        }

        return await minerService.updateOne(miner._id.toString(), {
            registered: true,
            status: MinerStatuses.ACTIVE,
            connectedDate: new Date(),
        });
    },
    disConnectMiner: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
        const {data} = args;
        const {code} = data;

        const miner: any = await minerService.findOne({code});
        if (!miner || miner.customerId !== context.id) {
            throw new Error("miner is missing or invalid.");
        }
        const now = new Date();
        const connectedDate = miner.connectedDate ? new Date(miner.connectedDate) : null;

        let uptimeInSeconds = 0;
        if (connectedDate) {
            uptimeInSeconds = Math.floor((now.getTime() - connectedDate.getTime()) / 1000);
        }

        return await minerService.updateOne(miner._id.toString(), {
            customerId: null,
            status: MinerStatuses.ACTIVE,
            registered: false,
            totalUptime: (miner.totalUptime || 0) + uptimeInSeconds,
        });
    },
    createMiner: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
        const {data} = args;
        return await minerService.create(data);
    },
    updateMiner: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
        const {id, data} = args;
        return await minerService.updateOne(id, data);
    },
    deleteOneMiner: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR);
        const {id} = args;
        return await minerService.deleteOne(id);
    },
};

const Miner = {
    customer: async (parent: { customerId: any; }) => {
        return CustomerModel.findById(parent.customerId);
    },
    totalUptime: async (parent: { id: any, customerId: any; connectedDate: any; totalUptime: any; status: any}) => {
        let {connectedDate, status} = parent;
        if (!connectedDate || status !== MinerStatuses.ACTIVE) {
            return 0
        }
        const dateCheck = new Date(connectedDate);
        let uptimeInSeconds = 0;
        const now = new Date();
        if (dateCheck) {
            uptimeInSeconds = Math.floor((now.getTime() - dateCheck.getTime()) / 1000);
        }

        return uptimeInSeconds;
    },
    emission: async (parent: { id: any, customerId: any; connectedDate: any}) => {
        let {id, customerId, connectedDate} = parent;
        if (!customerId || !connectedDate) {
            return {
                speedPerMiner: 0,
                totalEmission: 0
            }
        }
        const earliestMiner = await MinerModel.findById(id)
            .select('connectedDate')
            .sort({ connectedDate: 1 })
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
        const nodeCount = await MinerModel.countDocuments({ status: MinerStatuses.ACTIVE });
        const position = await MinerModel.countDocuments({
            registered: true,
            connectedDate: { $lt: connectedDate },
        });
        const speedPerMiner = EmissionHelper.getRewardPerSecond(position, nodeCount, uptimeInDays) || 0;

        const now = new Date();
        const dateCheck = new Date(connectedDate);
        let uptimeInSeconds = 0;
        if (dateCheck) {
            uptimeInSeconds = Math.floor((now.getTime() - dateCheck.getTime()) / 1000);
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
