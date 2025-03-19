import Router from "express";
import { Request, Response } from "express";
import { TestUser } from "@/types/user";

let users: TestUser[] = [];

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).json(users);
});

router.post("/register", (req: Request, res: Response) => {
  const { email, password, name, age } = req.body;

  const user: TestUser = {
    id: Math.random().toString(36).slice(2, 9),
    email,
    password,
    name,
    age,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(user);
  res.status(201).json(user);
});

export default router;
