import dotenv from "dotenv";
import path from "path";
import { env } from "process";


dotenv.config({
  quiet: true,
  path: path.join(process.cwd(), ".env"),
});


const config = {
  port: env.PORT || 5000,
  environment: env.NODE_ENV || "development",
  database_url: env.DATABASE_URL as string,
  app_url : env.APP_URL,
  bcrypt_salt_rounds : env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret : env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret : env.JWT_REFRESH_SECRET!,
  jwt_access_expires_in : env.JWT_ACCESS_EXPIRES_IN!,
  jwt_refresh_expires_in : env.JWT_REFRESH_EXPIRES_IN!,
  stripe_product_price_id : env.STRIPE_PRODUCT_PRICE_ID!,
  stripe_secret_key : env.STRIPE_SECRET_KEY!,
  stripe_webhook_secret: env.STRIPE_WEBHOOK_SECRET!
};

export default config;