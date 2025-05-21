import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { minerService } from "./miner.service";
import { MinerStatuses} from "../../modules/miner/miner.model";

const Query = {
  getAllMiner: async (root: any, args: any, context: Context) => {
    // context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    return minerService.fetch(args.q);
  },
  getOneMiner: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { id } = args;
    return await minerService.findOne({ _id: id });
  },
};

const Mutation = {
  scanMiner: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { data } = args;
    const { code } = data;

    const dataInsert = {
      code: Date.now().toString(36).toUpperCase(),
      name: `Miner ${code}`,
      blockChainAddress: Date.now().toString(36).toUpperCase(),
      customerId: context.id,
      status: MinerStatuses.ACTIVE,
      registered: false,
      totalTokensMined: 0,
      totalUptime: 0,
      currentHashRate: 0,
      lastActive: new Date(),
    };

    return await minerService.create(dataInsert);
  },
  connectMiner: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { data } = args;
    const { code } = data;

    const miner = await minerService.findOne({ code });
    return await minerService.updateOne(miner._id.toString(), {
      ...miner,
      customerId: context.id
    });
  },
  disConnectMiner: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { data } = args;
    const { code } = data;

    const miner = await minerService.findOne({ code });
    return await minerService.updateOne(miner._id.toString(), {
      ...miner,
      customerId: ''
    });
  },
  createMiner: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { data } = args;
    return await minerService.create(data);
  },
  updateMiner: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_CUSTOMER);
    const { id, data } = args;
    return await minerService.updateOne(id, data);
  },
  deleteOneMiner: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await minerService.deleteOne(id);
  },
};

const Miner = {
  
};

export default {
  Query,
  Mutation,
  Miner,
};
