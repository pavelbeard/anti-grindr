import path from "path";
import { fileURLToPath } from "url";
import yaml from "yamljs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 5100;
const NODE_JWT_SECRET_KEY =
  process.env.NODE_ENV == "development"
    ? "change_me"
    : process.env.JWT_SECRET_KEY;
const swaggerDocs = yaml.load(path.join(__dirname, "./swagger.yaml"));

// JWT

const JWT_TOKEN_EXPIRATION_TIME = "1h";
const JWT_REFRESH_TOKEN_EXPIRATION_TIME = "7d";
const JWT_HTTP_SECURED = process.env.NODE_ENV == "production";

// Public routes

const PUBLIC_ROUTES = ["/api/auth/sign-in", "/api/auth/create"];

export {
  JWT_HTTP_SECURED,
  JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  JWT_TOKEN_EXPIRATION_TIME,
  NODE_JWT_SECRET_KEY,
  PORT,
  PUBLIC_ROUTES,
  swaggerDocs,
};
