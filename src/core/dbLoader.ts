import mongoose, { Connection, ConnectOptions } from "mongoose";
import MongoTransport from "winston-mongodb";
import { Logger, LogHelper } from "../core/logger";

class DatabaseLoader {
  private connection: Connection | null = null;
  private dbUri: string = null;

  constructor(dbUri: string) {
    if (typeof dbUri !== "string") {
      throw new Error("Invalid database URI");
    }

    this.dbUri = dbUri;
    this.connection = mongoose.createConnection(this.dbUri, {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });

    this.events()
    
    // LogHelper.getHeading("----- Db Connected -----");
  }

  events (){
    this.connection.on('connected', () => Logger.info("----- 🏪 Db connected ----- 🌕"));
    this.connection.on('open', () => Logger.info("----- 🏪 Db open ----- 🌝"));
    this.connection.on('disconnected', () => Logger.info("----- 🏪 Db disconnected ----- 🌒"));
    this.connection.on('reconnected', () => Logger.info("----- 🏪 Db reconnected ----- 🌗"));
    this.connection.on('disconnecting', () => Logger.info("----- 🏪 Db disconnecting ----- 🌒"));
    this.connection.on('close', () => Logger.info("----- 🏪 Db close ----- 🌑"));
  }

  public getConnection() {
    return this.connection;
  }

  public transportLog = () => new MongoTransport.MongoDB({
    db: this.dbUri,
    collection: "errorlog",
    level: "error",
    tryReconnect: true,
    options: { useUnifiedTopology: true },
  });
}

export default DatabaseLoader;
