import dotenv from "dotenv"
dotenv.config()

export default {
  APP_PRODUCTION: process.env.APP_PRODUCTION?.toLowerCase() === "true",
  APP_PORT: Number(process.env.APP_PORT ?? 9001),
  APP_HOST: process.env.APP_HOST ?? "localhost",

  DB_URI: process.env.DB_URI ?? "mongodb://localhost:27017",
  DB_NAME: process.env.DB_NAME ?? "ingetya",

  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN ?? "DISCORD_BOT_TOKEN",
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ?? "DISCORD_CLIENT_ID",

  MIDTRANS_PRODUCTION: process.env.MIDTRANS_PRODUCTION?.toLowerCase() === "true",

  SB_MIDTRANS_SERVER_KEY: process.env.SB_MIDTRANS_SERVER_KEY ?? "MIDTRANS_SERVER_KEY",
  SB_MIDTRANS_CLIENT_KEY: process.env.SB_MIDTRANS_CLIENT_KEY ?? "MIDTRANS_CLIENT_KEY",

  PR_MIDTRANS_SERVER_KEY: process.env.PR_MIDTRANS_SERVER_KEY ?? "SB_MIDTRANS_SERVER_KEY",
  PR_MIDTRANS_CLIENT_KEY: process.env.PR_MIDTRANS_CLIENT_KEY ?? "MIDTRANS_CLIENT_KEY",

  SESSION_SECRET: process.env.SESSION_SECRET ?? "secret",

  LUNA_CLIENT_ID: process.env.LUNA_CLIENT_ID ?? "secret",
  LUNA_CLIENT_SECRET: process.env.LUNA_CLIENT_SECRET ?? "secret",

  S3_TOKEN: process.env.S3_TOKEN ?? "secret",
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID ?? "secret",
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY ?? "secret",
  S3_ENDPOINT: process.env.S3_ENDPOINT ?? "secret",
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME ?? "secret",

  PUBLIC_BUCKET: process.env.PUBLIC_BUCKET ?? "secret"
}
