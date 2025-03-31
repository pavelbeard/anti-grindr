import { AppError } from "@/lib/utility-classes.ts";
import { JWT_HTTP_SECURED } from "@/settings.ts";
import * as AuthService from "@/user/user.service.ts";
import { CreateUserSchema, SignInUserSchema } from "@/user/user.types.ts";
import type { Request, RequestHandler, Response } from "express";

// TODO: implement Oauth2 flow

export const signUp: RequestHandler = async (
  req: Request<unknown, unknown, CreateUserSchema>,
  res: Response
) => {
  const userData = {
    email: req.body.email,
    password: req.body.password,
  };

  if (await AuthService.findUserByEmail(userData.email)) {
    throw new AppError("validation", "User already exists.");
  }

  const newUser = await AuthService.createUser(userData);

  res
    .status(201)
    .json({ message: "User created successfully.", user: newUser });
};

export const signIn: RequestHandler = async (
  req: Request<unknown, unknown, SignInUserSchema>,
  res: Response
) => {
  const { email, password } = req.body;

  const existingUser = await AuthService.findUserByEmail(email);

  if (!existingUser) {
    throw new AppError("notFound", "User not found.");
  }

  if (!AuthService.comparePassword(password, existingUser.password)) {
    throw new AppError("validation", "Password is wrong.");
  }

  const token = AuthService.createToken(existingUser);
  const refreshToken = AuthService.createRefreshToken(existingUser.id);

  const publicUser = AuthService.omitSecretFields(existingUser);

  res
    .status(200)
    .cookie("__rclientid", refreshToken, {
      httpOnly: true,
      secure: JWT_HTTP_SECURED,
      sameSite: "strict",
    })
    .json({ user: publicUser, token });
};

export const signOut: RequestHandler = async (req: Request, res: Response) => {
  const refreshToken = req.cookies["__rclientid"];
  if (!refreshToken) {
    throw new AppError("validation", "Refresh token not found.");
  }

  const existingUser = await AuthService.findByRefreshToken(refreshToken);

  if (!existingUser) {
    throw new AppError("notFound", "User not found.");
  }

  await AuthService.deleteRefreshToken(existingUser, refreshToken);

  res
    .status(200)
    .clearCookie("__rclientid")
    .json({ message: "User signed out successfully." });
};

export const refreshToken: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const refreshToken = req.cookies["__rclientid"];

  if (!refreshToken) {
    throw new AppError("validation", "Refresh token not found.");
  }

  const existingUser = await AuthService.findByRefreshToken(refreshToken);

  if (!existingUser) {
    throw new AppError("notFound", "User not found.");
  }

  const token = AuthService.createToken(existingUser);
  const newRefreshToken = AuthService.createRefreshToken(existingUser.id);

  res
    .status(200)
    .cookie("__rclientid", newRefreshToken, {
      httpOnly: true,
      secure: JWT_HTTP_SECURED,
      sameSite: "strict",
    })
    .json({ token });
};

export const getUser: RequestHandler = async (req: Request, res: Response) => {
  const user = await AuthService.findUserById(req.params.id);

  if (!user) {
    throw new AppError("notFound", "User not found.");
  }

  const publicUser = AuthService.omitSecretFields(user);

  res.status(200).json({ user: publicUser });
};

export const updateEmail: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const userData = {
    id: req.params.id,
    newEmail: req.body.newEmail,
    actualPassword: req.body.actualPassword,
  };

  const existingUser = await AuthService.findUserById(userData.id);

  if (!existingUser) {
    throw new AppError("notFound", "User not found.");
  }

  const userPassword = AuthService.comparePassword(
    userData.actualPassword,
    existingUser.password
  );

  if (!userPassword) {
    throw new AppError("validation", "Actual password is wrong.");
  }

  const updatedUser = AuthService.omitSecretFields(
    await AuthService.updateUser(userData.id, {
      ...existingUser,
      email: userData.newEmail,
    })
  );

  res
    .status(200)
    .json({ message: "User email updated successfully.", user: updatedUser });
};

export const updatePassword: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const userData = {
    id: req.params.id,
    newPassword: req.body.newPassword,
    actualPassword: req.body.actualPassword,
  };

  const existingUser = await AuthService.findUserById(userData.id);

  if (!existingUser) {
    throw new AppError("notFound", "User not found.");
  }

  const userPassword = AuthService.comparePassword(
    userData.actualPassword,
    existingUser.password
  );

  if (!userPassword) {
    throw new AppError("validation", "Actual password is wrong.");
  }

  const updatedUser = AuthService.omitSecretFields(
    await AuthService.updateUser(userData.id, {
      ...existingUser,
      password: userData.newPassword,
    })
  );

  res
    .status(200)
    .json({
      message: "User password updated successfully.",
      user: updatedUser,
    });
};

export const deleteAccount: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const userData = {
    id: req.params.id,
    actualPassword: req.body.actualPassword,
  };

  const existingUser = await AuthService.findUserById(userData.id);

  if (!existingUser) {
    throw new AppError("notFound", "User not found.");
  }

  const userPassword = AuthService.comparePassword(
    userData.actualPassword,
    existingUser.password
  );

  if (!userPassword) {
    throw new AppError("validation", "Actual password is wrong.");
  }

  await AuthService.deleteUser(userData.id);

  res
    .status(204)
    .clearCookie("__rclientid")
    .json({ message: "User deleted successfully." });
};
