import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { contactService } from "./contact.service";

const Query = {
  getAllContact: async (root: any, args: any, context: Context) => {
    return contactService.fetch(args.q);
  },
  getOneContact: async (root: any, args: any, context: Context) => {
    const { id } = args;
    return await contactService.findOne({ _id: id });
  },
};

const Mutation = {
  createContact: async (root: any, args: any, context: Context) => {
    const { data } = args;
    return await contactService.create(data);
  },
  updateContact: async (root: any, args: any, context: Context) => {
    const { id, data } = args;
    return await contactService.updateOne(id, data);
  },
  deleteOneContact: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await contactService.deleteOne(id);
  },
};

const Contact = {
  
};

export default {
  Query,
  Mutation,
  Contact,
};
