import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import { PORT, swaggerDocs } from "@/settings";
import swaggerUi from "swagger-ui-express";

import userRouter from "@/routes/user";
import messageRouter from "@/routes/message";

config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Hello World!");
});

// routers

app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
