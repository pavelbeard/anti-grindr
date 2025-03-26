import { AuthController } from "@/controllers/user.ts";
import createToken from "@/lib/user/create-token.ts";
import { JWT_HTTP_SECURED } from "@/settings.ts";
import {
  CreateUser,
  SignInUser,
  UpdateEmail,
  UpdatePassword,
} from "@/types/user.ts";
import type { Request, Response } from "express";
import { Router } from "express";

const authRouter: Router = Router();

authRouter.post("/sign-in", async (req: Request, res: Response) => {
  const user = await AuthController.signIn(req.body as SignInUser);
  const token = createToken(user);

  res
    .status(200)
    .cookie("__clientid", token, {
      httpOnly: true,
      secure: JWT_HTTP_SECURED,
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    })
    .send({ ...user, token });
});

authRouter.post("/create", async (req: Request, res: Response) => {
  const user = await AuthController.createUser(req.body as CreateUser);
  res.status(201).json(user);
});

authRouter.get("/:id", async (req: Request, res: Response) => {
  const user = await AuthController.getUser({ id: req.params.id });
  res.status(200).json(user);
});

authRouter.patch("/:id/update-email", async (req: Request, res: Response) => {
  const user = await AuthController.updateEmail({
    id: req.params.id,
    data: req.body as UpdateEmail,
  });
  res.status(200).json(user);
});

authRouter.patch(
  "/:id/update-password",
  async (req: Request, res: Response) => {
    const user = await AuthController.updatePassword({
      id: req.params.id,
      data: req.body as UpdatePassword,
    });
    res.status(200).json(user);
  }
);

export default authRouter;
