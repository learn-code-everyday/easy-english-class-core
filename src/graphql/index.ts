import { ApolloServer, gql } from "apollo-server-express";
import { Express } from "express";
import _ from "lodash";
import minifyGql from "minify-graphql-loader";
import morgan from "morgan";
import path from "path";
import { Request } from "../base/baseRoute";
import { configs } from "../configs";
import { ErrorHelper, UtilsHelper } from "../helpers";
import { LogHelper, Logger } from "../core/logger";
import { onContext } from "../core/context";
import {
  DateTimeResolver,
  DateTimeTypeDefinition,
} from "graphql-scalars";
import { walkSyncFiles } from "../core/walkSyncFiles";

class ApolloServerLoader {
  private app: Express;
  private server: ApolloServer<any>;

  constructor(app: Express) {
    this.app = app;

  }

  async startGraphql() {
    await this.configureApolloServer();
    this.applyMiddleware();
  }

  private async configureApolloServer() {
    const typeDefs = [
      gql`
        scalar Mixed
        scalar Upload
        ${DateTimeTypeDefinition}

        type Query {
          _empty: String
        }
        type Mutation {
          _empty: String
        }
        type Subscription {
          _empty: String
        }
        input QueryGetListInput {
          limit: Int
          offset: Int
          page: Int
          order: Mixed
          filter: Mixed
          search: String
        }

        type Pagination {
          limit: Int
          offset: Int
          page: Int
          total: Int
        }
      `,
    ];

    let resolvers = {};
    let defaultFragment: any = {};

    const ModuleFiles = walkSyncFiles(
      path.join(__dirname, "modules")
    );
    ModuleFiles.filter((f: any) => /(.*).schema.js$/.test(f)).map((f: any) => {
      const { default: schema } = require(f);
      typeDefs.push(schema);
    });
    ModuleFiles.filter((f: any) => /(.*).resolver.js$/.test(f)).map(
      (f: any) => {
        const { default: resolver } = require(f);
        resolvers = _.merge(resolvers, resolver);
      }
    );
    ModuleFiles.filter((f: any) => /(.*).fragment.js$/.test(f)).map(
      (f: any) => {
        const { default: fragment } = require(f);
        defaultFragment = _.merge(defaultFragment, fragment);
      }
    );
    ModuleFiles.filter((f: any) => /(.*).graphql.js$/.test(f)).map(
      (f: any) => {
        const {
          default: { resolver, schema },
        } = require(f);
        if (schema) typeDefs.push(schema);
        if (resolver) resolvers = _.merge(resolvers, resolver);
        resolvers = _.merge(resolvers, DateTimeResolver);
      }
    );

    this.server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true,
      context: onContext,
      debug: configs.debug,
      cache: "bounded",
      persistedQueries: false,
      formatError(err) {
        try {
          console.log("format error", err.message);
          Logger.error(err.message, {
            metadata: {
              stack: err.stack,
              name: err.name,
              message: err.message,
              extensions: err.extensions,
            },
          });
          if (err.extensions && !err.extensions.exception.code) {
            ErrorHelper.logUnknownError(err);
          }
        } catch (err) { }
        return err;
      },
    });

    const skipRequestOption = {
      skip: (req: Request) =>
        (_.get(req, "body.query") || "").includes("IntrospectionQuery"),
    };

    const defaultFragmentFields = Object.keys(defaultFragment);
    morgan.token("gql-query", (req: Request) => req.body.query);
    this.app.use(
      "/graphql",
      (req, res, next) => {
        if (req.body && req.body.query) {
          let minify = minifyGql(req.body.query);
          for (const field of defaultFragmentFields) {
            minify = minify.replace(
              new RegExp(field + "( |})", "g"),
              field + defaultFragment[field] + "$1"
            );
          }
          req.body.query = minify;
        }
        next();
      },
      morgan(LogHelper.createMorganGraphqlToken, skipRequestOption)
    );
    await this.server.start();
  }

  private applyMiddleware = () => {
    this.server.applyMiddleware({
      app: this.app,
      cors: {
        credentials: true,
        origin: (origin, callback) => {
          callback(null, true);
        },
      },
    });
  }
}

export default ApolloServerLoader;
