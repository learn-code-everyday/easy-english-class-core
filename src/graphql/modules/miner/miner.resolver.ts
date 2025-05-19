import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { minerService } from "./miner.service";

const Query = {
  getAllMiner: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    return minerService.fetch(args.q);
  },
  getOneMiner: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await minerService.findOne({ _id: id });
  },
};

const Mutation = {
  createMiner: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    return await minerService.create(data);
  },
  updateMiner: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
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
