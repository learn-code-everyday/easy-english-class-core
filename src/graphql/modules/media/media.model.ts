import mongoose from 'mongoose';

import { MainConnection } from '../../../loaders/database.loader';
import { BaseDocument, ModelLoader, ModelHook } from '../../../base/baseModel';

export enum MediaStatuses {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export type Media = {
    name?: string;
    url?: string;
    status?: MediaStatuses;
};

const Schema = mongoose.Schema;

export type IMedia = BaseDocument & Media;

const mediaSchema = new Schema(
    {
        name: { type: String },
        url: { type: String },
        status: { type: String, enum: MediaStatuses, default: MediaStatuses.ACTIVE },
    },
    { timestamps: true },
);

mediaSchema.index({ url: 'text' }, { weights: { name: 2 } });

export const MediaHook = new ModelHook<IMedia>(mediaSchema);
export const MediaModel: mongoose.Model<IMedia> = MainConnection.model('Media', mediaSchema);

export const MediaLoader = ModelLoader<IMedia>(MediaModel, MediaHook);
