import { createProfile } from "@/controllers/profile.ts";
import { User } from "@prisma/client";
import type { Request, Response } from "express";
import { Router } from "express";

const profileRouter: Router = Router();

profileRouter.post("/:userId/create", async (req: Request, res: Response) => {
  const profile = await createProfile(req.params.userId as User["id"]);
  res.status(201).json(profile);
});

export default profileRouter;
