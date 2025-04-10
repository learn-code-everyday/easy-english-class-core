import winston from "winston";
import morgan from "morgan";
import chalk from "chalk";

import { configs } from "../configs";
import { MainDb } from "../loaders/database.loader";

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  verbose: "gray",
  debug: "blue",
  silly: "grey",
};

winston.addColors(colors);

const formatedWinston = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.cli(),
    winston.format.splat(),
  ),
});

let transports: any = [
  // new winston.transports.File({ filename: `${__dirname}/../../error.log`, level: 'error', options: { flags: 'a', mode: 0o755 } }),
  // new winston.transports.File({ filename: `${__dirname}/../../combined.log`, options: { flags: 'a', mode: 0o755 } })
];
if (process.env.NODE_ENV !== "development") {
  transports.push(formatedWinston);
} else {
  // transports.push(new MongoTransport.MongoDB({ db: configs.winston.db }));
  transports.push(MainDb.transportLog());
  transports.push(formatedWinston);
}

if (process.env.NODE_ENV === "testing") {
  transports = [];
}

const Logger = winston.createLogger({
  level: configs.winston.level,
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports,
});


class LogHelper {
  static runingJobLog = (jobname: string) => {
    // console.log(chalk.blue("⏰⏰⏰ Execute Job ") + jobname, chalk.red(moment().format()));
  };

  static createApiGraphqlToken = (
    tokens: morgan.TokenIndexer<any, any> | any,
    req: any,
    res: any,
  ) =>
    [
      "🌎" + chalk.blue(tokens["remote-addr"](req, res)),
      chalk.cyanBright(tokens["remote-user"](req, res) || "🤪-No-user"),
      "🛰️🛰️🛰️" + chalk.green(tokens["method"](req, res)),
      chalk.red(tokens["url"](req, res)),
      "✨" + chalk.blue("HTTP/" + tokens["http-version"](req, res)),
      "🔥🔥🔥" + chalk.redBright(tokens["status"](req, res)),
      "⏱️ " + chalk.red(tokens["response-time"](req, res)) + " ms",
    ].join("...");

  static getChalkGQL = (query: string) => {
    try {
      const newstringreplaced = query
        .replace(/[(]/gi, " ( ")
        .replace(/[)]/gi, " ) ")
        .replace(/[:]/gi, " : ")
        .replace(/[{]/gi, " { ")
        .replace(/[}]/gi, " } ");

      let newArr = newstringreplaced.split(" ");
      for (let i = 0; i < newArr.length; i++) {
        if (newArr[i].match("query")) {
          newArr[i] = chalk.cyan(newArr[i]);
        } else if (newArr[i].match("mutation")) {
          newArr[i] = chalk.greenBright(newArr[i]);
        } else if (newArr[i].match(/[$q]/gi)) {
          newArr[i] = chalk.red(newArr[i]);
        } else if (newArr[i].match(/q/gi)) {
          newArr[i] = chalk.red(newArr[i]);
        } else if (newArr[i].match(/data/gi)) {
          newArr[i] = chalk.red(newArr[i]);
        } else if (newArr[i].match("__typename")) {
          newArr[i] = chalk.red(newArr[i]);
        } else if (newArr[i].match(/[():{}]/gi)) {
          newArr[i] = chalk.cyan(newArr[i]);
        } else {
          newArr[i] = chalk.italic(chalk.magenta(newArr[i]));
        }
      }
      return newArr.join(" ");
    } catch (error) {
      return query;
    }
  };

  static createMorganGraphqlToken = (
    tokens: morgan.TokenIndexer<any, any> | any,
    req: any,
    res: any,
  ) =>
    [
      "🌎" + chalk.blue(tokens["remote-addr"](req, res)),
      chalk.cyanBright(tokens["remote-user"](req, res) || "🤪-No-user"),
      " 🛰️🛰️🛰️ " + chalk.green(tokens["method"](req, res)),
      chalk.red(tokens["url"](req, res)),
      "🤖🤖🤖 " + LogHelper.getChalkGQL(tokens["gql-query"](req, res)),
      "✨" + chalk.blue("HTTP/" + tokens["http-version"](req, res)),
      "🔥🔥🔥" + chalk.redBright(tokens["status"](req, res)),
      "⏱️ " + chalk.red(tokens["response-time"](req, res)) + " ms",
    ].join("...");

  static createNormalMorganGraphqlToken = () => {
    return ":remote-addr :remote-user :method :url :gql-query HTTP/:http-version :status :res[content-length] - :response-time ms";
  };

  static getHeading = (text: string) => {
    const initSpace = "     ";
    const length = initSpace.length * 2 + text.length;
    const padding = Array.from({ length }, (v, i) => " ").join("");
    console.log(
      chalk.bgHex("#4E7921")(
        "\n" + padding + "\n" + `${initSpace}${text}${initSpace}` + "\n" + padding + "\n",
      ),
    );
  };

  static logString = (content: string, link: string) => {
    console.log(chalk.yellow(content) + " : " + chalk.redBright(link));
  };
}



export { Logger, LogHelper };


