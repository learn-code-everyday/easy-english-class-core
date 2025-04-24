import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../core/context";
import { productService } from "./product.service";

const Query = {
  getAllProduct: async (root: any, args: any, context: Context) => {
    return productService.fetch(args.q);
  },
  getOneProduct: async (root: any, args: any, context: Context) => {
    const { id } = args;
    return await productService.findOne({ _id: id });
  },
};

const Mutation = {
  createProduct: async (root: any, args: any, context: Context) => {
    const { data } = args;
    return await productService.create(data);
  },
  updateProduct: async (root: any, args: any, context: Context) => {
    const { id, data } = args;
    return await productService.updateOne(id, data);
  },
  deleteOneProduct: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await productService.deleteOne(id);
  },
};

const Product = {
  
};

export default {
  Query,
  Mutation,
  Product,
};
