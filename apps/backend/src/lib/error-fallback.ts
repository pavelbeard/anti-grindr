import {
  PasswordsAreNotMatchError,
  UnauthorizedError,
  UpdateEmailError,
  UserNotFoundError,
} from "@/errors/auth.ts";
import type { NextFunction, Request, Response } from "express";

export default function errorFallback(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  //   auth errors
  if (err instanceof UpdateEmailError) {
    res.status(400).json({ message: err.message });
    next();
  }

  if (err instanceof PasswordsAreNotMatchError) {
    res.status(400).json({ message: err.message });
    next();
  }

  if (err instanceof UnauthorizedError) {
    res.status(401).json({ message: err.message });
    next();
  }

  if (err instanceof UserNotFoundError) {
    res.status(404).json({ message: err.message });
    next();
  }

  //   other errors

  if (err instanceof Error) {
    res.status(500).json({ message: err.message });
    next();
  }
}
