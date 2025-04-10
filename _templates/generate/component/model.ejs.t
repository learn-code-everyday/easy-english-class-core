---
to: src/graphql/modules/<%= h.inflection.camelize(name, true) %>/<%= h.inflection.camelize(name, true) %>.model.ts
---
import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database.loader";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";

export enum <%= h.inflection.camelize(name) %>Statuses {
    ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type <%= h.inflection.camelize(name) %> = {
  name?: string;
  status?: <%= h.inflection.camelize(name) %>Statuses;
};

const Schema = mongoose.Schema;

export type I<%= h.inflection.camelize(name) %> = BaseDocument & <%= h.inflection.camelize(name) %>;

const <%= h.inflection.camelize(name, true) %>Schema = new Schema(
  {
    name: { type: String },
    status: { type: String, enum: <%= h.inflection.camelize(name) %>Statuses, default: <%= h.inflection.camelize(name) %>Statuses.ACTIVE },
  },
  { timestamps: true }
);

// <%= h.inflection.camelize(name, true) %>Schema.index({ name: "text" }, { weights: { name: 2 } });

export const <%= h.inflection.camelize(name) %>Hook = new ModelHook<I<%= h.inflection.camelize(name) %>>(<%= h.inflection.camelize(name, true) %>Schema);
export const <%= h.inflection.camelize(name) %>Model: mongoose.Model<I<%= h.inflection.camelize(name) %>> = MainConnection.model(
  "<%= h.inflection.camelize(name) %>",
  <%= h.inflection.camelize(name, true) %>Schema
);

export const <%= h.inflection.camelize(name) %>Loader = ModelLoader<I<%= h.inflection.camelize(name) %>>(<%= h.inflection.camelize(name) %>Model, <%= h.inflection.camelize(name) %>Hook);
