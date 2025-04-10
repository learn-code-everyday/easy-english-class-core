import { set } from "lodash";
import { ROLES } from "../../../constants/role.const";
import { GraphLoader } from "../../../core/loader";
import { Context } from "../../../core/context";
import { UserLoader } from "../user/user.model";
import { agendaJobService } from "./agendaJob.service";

const Query = {
  getAllAgendaJob: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    return agendaJobService.fetch(args.q);
  },
  getOneAgendaJob: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id } = args;
    return await agendaJobService.findOne({ _id: id });
  },
};

const Mutation = {
  updateAgendaJob: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id, data } = args;
    set(data, "lastModifiedBy", context.id);
    return await agendaJobService.updateOne(id, data);
  },
  deleteOneAgendaJob: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id } = args;
    return await agendaJobService.deleteOne(id);
  },
};

const AgendaJob = {
  lastModifiedByUser: GraphLoader.loadById(UserLoader, "lastModifiedBy"),
};

export default {
  Query,
  Mutation,
  AgendaJob,
};
