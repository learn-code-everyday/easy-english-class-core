---
to: src/graphql/modules/<%= h.inflection.camelize(name, true) %>/resolvers/<%= h.inflection.camelize(f, true) %>.resolver.ts
---
import { ROLES } from "../../../../constants/role.const";
import { Context } from "../../../../core/context";

const Query = {
  <%= h.inflection.camelize(f, true) %>: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    //code here
    return {}
  },
};

export default { Query };
