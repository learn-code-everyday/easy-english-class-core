import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export enum ContactStatuses {
    ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type Contact = {
  name?: string;
  phone?: string;
  notice?: string;
  status?: ContactStatuses;
};

const Schema = mongoose.Schema;

export type IContact = BaseDocument & Contact;

const contactSchema = new Schema(
  {
    name: { type: String },
    phone: { type: String },
    notice: { type: String },
    status: { type: String, enum: ContactStatuses, default: ContactStatuses.ACTIVE },
  },
  { timestamps: true }
);

// contactSchema.index({ name: "text" }, { weights: { name: 2 } });

export const ContactHook = new ModelHook<IContact>(contactSchema);
export const ContactModel: mongoose.Model<IContact> = MainConnection.model(
  "Contact",
  contactSchema
);

export const ContactLoader = ModelLoader<IContact>(ContactModel, ContactHook);
