import mongoose from "mongoose";
import {MainConnection} from "../../../loaders/database.loader";
import {BaseDocument, ModelLoader, ModelHook} from "../../../base/baseModel";
import {ContentLanguage} from "@/graphql/modules/content/content.model";

export enum ProductStatuses {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export type Product = {
    name?: string;
    language: {type: String, enum: ContentLanguage, default: ContentLanguage.US},
    status?: ProductStatuses;
    description: {
        price: number,
        discountPrice: number,
        discount: number,
        subscription: string,
        poweredBy: string,
        shippingTime: string,
        returnPolicy: string,
    }
    action: [{
        icon: string,
        title: string,
        description: string,
    }];
    future: [{
        href: string,
        title: string,
        description: string,
    }];
    allInOne: [{
        icon: string,
        title: string,
        description: string,
    }],
    techSpecs: {
        icon: string,
        info: [{
            categories: string,
            description: string,
        }],
    },
};

const Schema = mongoose.Schema;

export type IProduct = BaseDocument & Product;

const productSchema = new Schema(
    {
        name: {type: String},
        language: {type: String},
        status: {type: String, enum: ProductStatuses, default: ProductStatuses.ACTIVE},
        description: {
            price: {type: String},
            discountPrice: {type: String},
            discount: {type: String},
            subscription: {type: String},
            poweredBy: {type: String},
            shippingTime: {type: String},
            returnPolicy: {type: String},
        },
        action: [{
            icon: {type: String},
            title: {type: String},
            description: {type: String},
        }],
        future: [{
            href: {type: String},
            title: {type: String},
            description: {type: String},
        }],
        allInOne: [{
            icon: {type: String},
            title: {type: String},
            description: {type: String},
        }],
        techSpecs: {
            icon: {type: String},
            info: [{
                categories: {type: String},
                description: {type: String},
            }],
        },
    },
    {timestamps: true}
);

// productSchema.index({ name: "text" }, { weights: { name: 2 } });

export const ProductHook = new ModelHook<IProduct>(productSchema);
export const ProductModel: mongoose.Model<IProduct> = MainConnection.model(
    "Product",
    productSchema
);

export const ProductLoader = ModelLoader<IProduct>(ProductModel, ProductHook);
