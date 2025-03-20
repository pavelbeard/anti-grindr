import { swaggerDocs } from "@/settings.ts";
import bodyParser from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";

import authRouter from "@/routes/auth.ts";
import messageRouter from "@/routes/message.ts";

config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Hello World!");
});

// routers

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

export default app;
