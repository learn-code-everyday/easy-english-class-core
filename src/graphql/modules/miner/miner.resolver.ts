import {ROLES} from "../../../constants/role.const";
import {Context} from "../../../core/context";
import {minerService} from "./miner.service";
import {set} from "lodash";
import {CustomerModel} from "../../modules/customer/customer.model";

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
        const {data} = args;
        const {code} = data;
        return minerService.findOne({code});
    },
    connectMiner: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
        const {data} = args;
        const {code} = data;

        const miner = await minerService.findOne({code});
        return await minerService.updateOne(miner._id.toString(), {
            customerId: context.id,
            registered: true,
            connectedDate: new Date()
        });
    },
    disConnectMiner: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
        const {data} = args;
        const {code} = data;

        const miner = await minerService.findOne({code});
        return await minerService.updateOne(miner._id.toString(), {
            customerId: null,
            registered: false,
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
};

export default {
    Query,
    Mutation,
    Miner,
};
