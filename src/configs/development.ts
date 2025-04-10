import base from "./base";

export default {
  ...base,
  env: "development",
  maindb: process.env["MONGODB_URI"],
  app1db: process.env["APP1_DB_URI"],
  adminUsername: process.env["ADMIN_USERNAME"],
  adminPassword: process.env["ADMIN_PASSWORD"],
  debug: true,
};
