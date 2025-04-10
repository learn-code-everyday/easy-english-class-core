import express from "express";
import { LogHelper, Logger } from "./core/logger";
import ExpressLoader from "./loaders/express.loader";
import ApolloServerLoader from "./graphql";

class Server {
  constructor() {
    this.setupApp();
  }

  setupApp() {
    const { app } = new ExpressLoader(express());

    LogHelper.getHeading(" --------- 🐵🐵🐵 monkey.js 🐵🐵🐵 ---------");
    Logger.info("🍌🍌🍌 Load Source Successfully 🍌🍌🍌 \n");

    const apolloLoader = new ApolloServerLoader(app);
    apolloLoader.startGraphql();

    app.listen(app.get("port"), () => {
      LogHelper.logString(
        `\n🚀 App is running in ${app.get("env")} mode at`,
        `http://localhost:${app.get("port")}/graphql \n`,
      );

      LogHelper.logString(
        `\n🚀 Apis Services is running in ${app.get("env")} mode at`,
        `http://localhost:${app.get("port")}/api-docs \n`
      );

      console.log("  Press CTRL-C to stop\n");
    });
    

  }
}

// Usage
new Server();
import "./init";
import "./scheduler";