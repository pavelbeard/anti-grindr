import prisma from "@/lib/prisma.ts";
import type { Profile, User } from "@prisma/client";
import type { Request, Response } from "express";

// TODO: Implement gender, pronoun, picture, album logic

export const createProfile = async (id: User["id"]) => {
  const profile: Profile | null = await prisma.profile.create({
    data: {
      userId: id,
    },
  });

  if (!profile) {
    throw new Error("Profile not created");
  }

  return profile;
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile: Profile | null = await prisma.profile.findUnique({
      where: { userId: id },
      include: {
        genders: true,
        pronouns: true,
        pictures: { orderBy: { order: "asc" } },
        albums: { orderBy: { order: "asc" } },
      },
    });

    if (!profile) {
      res.status(404).json({ error: "Profile not found " });
    }

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(err);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, age, bio, sexRole } = req.body;
    const { id } = req.params;
    const updatedProfile: Profile | null = await prisma.profile.update({
      where: { userId: id },
      data: {
        name,
        age: age ? Number(age) : undefined,
        bio,
        sexRole,
      },
    });

    if (!updatedProfile) {
      res.status(404).json({ error: "Profile not found" });
    }

    res.status(200).json(updatedProfile);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(err);
  }
};
