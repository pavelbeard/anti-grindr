import { swaggerDocs } from "@/settings.ts";
import bodyParser from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";

import authRouter from "@/routes/auth.ts";
import messageRouter from "@/routes/message.ts";
import errorFallback from "./lib/error-fallback.ts";

config();

const app: express.Application = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// error handler
app.use((err: unknown, req: Request, res: Response, next: NextFunction) =>
  errorFallback(err, req, res, next)
);

// routers

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

export default app;
