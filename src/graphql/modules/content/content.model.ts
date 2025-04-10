import mongoose from "mongoose";
import {MainConnection} from "../../../loaders/database.loader";
import {BaseDocument, ModelLoader, ModelHook} from "../../../base/baseModel";
import {SettingTypes} from "@/graphql/modules/setting/setting.model";
import {ActivityTypes} from "@/graphql/modules/activity/activity.model";

export enum ContentStatuses {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export enum ContentLanguage {
    KR = 'ko-KR',
    US = 'en-US',
    VN = 'vi-VN',
}

export type Content = {
    name?: string;
    status?: ContentStatuses;
};

const Schema = mongoose.Schema;

export type IContent = BaseDocument & Content;

const contentSchema = new Schema(
    {
        key: {type: String, required: true, unique: true},
        value: {type: String, required: true},
        language: {type: String, enum: ContentLanguage, default: ContentLanguage.US},
        isActive: {type: Boolean, required: true, default: true},
        status: {type: String, enum: ContentStatuses, default: ContentStatuses.ACTIVE},
    },
    {timestamps: true}
);

// contentSchema.index({ name: "text" }, { weights: { name: 2 } });

export const ContentHook = new ModelHook<IContent>(contentSchema);
export const ContentModel: mongoose.Model<IContent> = MainConnection.model(
    "Content",
    contentSchema
);

export const ContentLoader = ModelLoader<IContent>(ContentModel, ContentHook);
