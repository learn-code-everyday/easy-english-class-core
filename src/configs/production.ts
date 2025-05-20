import base from "./base";

export default {
  ...base,
  env: "production",
  maindb: process.env["MONGODB_URI"],
  app1db: process.env["APP1_DB_URI"],
  adminUsername: process.env["ADMIN_USERNAME"],
  adminPassword: process.env["ADMIN_PASSWORD"],
  domainFe: process.env["DOMAIN_FE"],
  protocol: process.env["PROTOCOL"],
  host: process.env["HOST"],
  googleClientId: process.env["YOUR_CLIENT_ID"],
  googleClientSecret: process.env["YOUR_CLIENT_SECRET"],
  smtpHost: process.env['SMTP_HOST'],
  smtpPort: process.env['SMTP_PORT'],
  smtpUser: process.env['SMTP_USER'],
  smtpPassword: process.env['SMTP_PASSWORD'],
  mailerFrom: process.env['MAILER_FROM'],
  adminMail: process.env['ADMIN_MAIL'],
  debug: false,
};
