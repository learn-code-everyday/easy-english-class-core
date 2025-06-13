import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { contentService } from "./content.service";

const Query = {
  getAllContent: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    return contentService.fetch(args.q);
  },
  getOneContent: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await contentService.findOne({ _id: id });
  },
};

const Mutation = {
  createContent: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    return await contentService.create(data);
  },
  updateContent: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await contentService.updateOne(id, data);
  },
  deleteOneContent: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id } = args;
    return await contentService.deleteOne(id);
  },
};

const Content = {
  
};

export default {
  Query,
  Mutation,
  Content,
};
