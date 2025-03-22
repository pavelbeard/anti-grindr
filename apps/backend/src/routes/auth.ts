import {
  createUser,
  getUser,
  updateEmail,
  updatePassword,
} from "@/controllers/auth.ts";
import { CreateUser, UpdateEmail, UpdatePassword } from "@/types/auth.ts";
import type { Request, Response } from "express";
import { Router } from "express";

const authRouter: Router = Router();

authRouter.post("/create", async (req: Request, res: Response) => {
  const user = createUser(req.body as CreateUser);
  res.status(201).json(user);
});

authRouter.get("/:id", async (req: Request, res: Response) => {
  const user = await getUser({ id: req.params.id });
  res.status(200).json(user);
});

authRouter.patch("/:id/update-email", async (req: Request, res: Response) => {
  const user = await updateEmail({
    id: req.params.id,
    data: req.body as UpdateEmail,
  });
  res.status(200).json(user);
});

authRouter.patch(
  "/:id/update-password",
  async (req: Request, res: Response) => {
    const user = await updatePassword({
      id: req.params.id,
      data: req.body as UpdatePassword,
    });
    res.status(200).json(user);
  }
);

export default authRouter;
