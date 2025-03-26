import errorFallback from "@/lib/error-fallback.ts";
import { originResolver } from "@/middlewares/cors-middleware.ts";
import { protectMiddleware } from "@/middlewares/user.ts";
import messageRouter from "@/routes/message.ts";
import usersRouter from "@/routes/user.ts";
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
    credentials: true,
    origin: (origin, callback) => originResolver(origin, callback),
  })
);

app.use(express.json());

app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.disable("x-powered-by");

// jwt

app.use((req: Request, res: Response, next: NextFunction) =>
  protectMiddleware(req, res, next)
);

// error handler
app.use((err: unknown, req: Request, res: Response, next: NextFunction) =>
  errorFallback(err, req, res, next)
);

// routers

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/user", usersRouter);
app.use("/api/message", messageRouter);

export default app;
