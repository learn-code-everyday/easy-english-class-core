import { mediaService } from './media.service';

import { ROLES } from '../../../constants/role.const';
import { Context } from '../../../core/context';

const Query = {
    getAllMedia: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR);

        return mediaService.fetch(args.q);
    },
    getOneMedia: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR);
        const { id } = args;

        return await mediaService.findOne({ _id: id });
    },
};

const Mutation = {
    createMedia: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR);
        const { data } = args;

        return await mediaService.create(data);
    },
    updateMedia: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR);
        const { id, data } = args;

        return await mediaService.updateOne(id, data);
    },
    deleteOneMedia: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR);
        const { id } = args;

        return await mediaService.deleteOne(id);
    },
};

const Media = {};

export default {
    Query,
    Mutation,
    Media,
};
