import { createUserController, getUserController } from "@/controllers/auth.ts";
import { CreateUser } from "@/types/auth.ts";
import type { Request, Response } from "express";
import { Router } from "express";

const authRouter: Router = Router();

authRouter.post("/create", async (req: Request, res: Response) => {
  try {
    const user = createUserController(req.body as CreateUser);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to create user" });
    console.error(err);
  }
});

authRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await getUserController({ id: req.params.id });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to get user" });
    console.error(err);
  }
});

export default authRouter;
