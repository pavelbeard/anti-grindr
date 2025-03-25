import { UnauthorizedError } from "@/errors/auth.ts";
import { NODE_JWT_SECRET_KEY, PUBLIC_ROUTES } from "@/settings.ts";
import { Session } from "@/types/auth.ts";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const routeIsPublic = (route: string) => PUBLIC_ROUTES.includes(route);

export default function protectMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.session = {
    user: null,
  };

  if (routeIsPublic(req.path)) {
    return next();
  }

  const token = req.cookies.__clientid;

  if (!token) {
    throw new UnauthorizedError("__clientid is missing");
  }

  try {
    const data = jwt.verify(
      token,
      NODE_JWT_SECRET_KEY as string
    ) as Session["user"];

    res.session.user = data;
  } catch {
    throw new UnauthorizedError("Invalid token");
  }

  next();
}
