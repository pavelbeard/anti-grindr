import protectMiddleware from "@/lib/auth/protect-middleware.ts";
import errorFallback from "@/lib/error-fallback.ts";
import authRouter from "@/routes/auth.ts";
import messageRouter from "@/routes/message.ts";
import { swaggerDocs } from "@/settings.ts";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import swaggerUi from "swagger-ui-express";

config();

const app: express.Application = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        "http://localhost:3000",
        "https://localhost:5173",
      ];

      if (ACCEPTED_ORIGINS.includes(origin as string)) {
        callback(null, true);
      } else if (!origin) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) =>
  protectMiddleware(req, res, next)
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.disable("x-powered-by");

// jwt

// error handler
app.use((err: unknown, req: Request, res: Response, next: NextFunction) =>
  errorFallback(err, req, res, next)
);

// routers

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

export default app;
