import {
  authorization,
  errorFallback,
  originResolver,
} from "@/lib/middlewares.ts";
import profileRouter from "@/profile/profile.router";
import { ALLOWED_ORIGINS, swaggerDocs } from "@/settings.ts";
import usersRouter from "@/user/user.router.ts";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
import swaggerUi from "swagger-ui-express";

config();

const app: express.Express = express();

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) =>
      originResolver(ALLOWED_ORIGINS, origin, callback),
  }),
);
app.use(express.json());
app.use(cookieParser());

// documentation

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// disable x-powered-by
app.disable("x-powered-by");

// routers
app.use("/api/user", usersRouter);
app.use("/api/profile", authorization, profileRouter);
// app.use('/api/message', authorization, messageRouter)

// error handler
app.use(errorFallback);

export default app;
