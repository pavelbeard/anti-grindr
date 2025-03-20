import type { Request, Response } from "express";
import type { User } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "@/connect-db.ts";

// implement Oauth2 flow

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user: User = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to register user" });
    console.error(err);
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user: User | null = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to get user" });
    console.error(err);
  }
};

export const updateEmail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newEmail, actualPassword } = req.body;

    if (!actualPassword) {
      res.status(400).json({ message: "Password is required" });
      return;
    }

    const userPassword = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        password: true,
      },
    });

    if (!userPassword) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!bcrypt.compareSync(actualPassword, userPassword.password)) {
      res.status(400).json({ message: "Password is not match " });
    }

    const updatedUser: User | null = await prisma.user.update({
      where: {
        id,
      },
      data: {
        email: newEmail,
      },
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Failed to update email" });
    console.error(err);
  }
};
