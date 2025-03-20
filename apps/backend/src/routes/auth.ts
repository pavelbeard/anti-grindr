import Router from "express";
import { getUser, registerUser } from "@/controllers/auth.ts";

const authRouter = Router();

authRouter.get("/", getUser);
authRouter.post("/register", registerUser);

export default authRouter;
