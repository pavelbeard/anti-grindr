import { NODE_JWT_SECRET_KEY, PUBLIC_ROUTES } from "@/settings.ts";
import { Session } from "@/types/user.ts";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const routeIsPublic = (route: string) => PUBLIC_ROUTES.includes(route);

export function protectMiddleware(
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
    res.status(403).send("Unauthorized");
    return;
  }

  try {
    const data = jwt.verify(
      token,
      NODE_JWT_SECRET_KEY as string
    ) as Session["user"];

    res.session.user = data;
  } catch {
    res.status(401).send("Invalid token");
    return;
  }

  next();
}
