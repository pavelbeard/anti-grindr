import { StaticOrigin } from "@/lib/types.ts";
import { AppError } from "@/lib/utility-classes.ts";
import {
  ALLOWED_ORIGINS,
  NODE_JWT_SECRET_KEY,
  PUBLIC_ROUTES,
} from "@/settings.ts";
import { Session } from "@/user/user.types.ts";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ZodError, type AnyZodObject } from "zod";

const routeIsPublic = (route: string) => PUBLIC_ROUTES.includes(route);

export function authorization(
  req: Request<unknown>,
  res: Response,
  next: NextFunction
) {
  res.session = {
    user: null,
  };

  if (req.method === "OPTIONS") {
    return res.send({ message: "Preflight checked successfully." });
  }

  if (routeIsPublic(req.path)) {
    return next();
  }

  if (!req.headers.authorization) {
    return next(
      new AppError("unauthorized", "`Authorization` header is required.")
    );
  }

  if (!req.headers.authorization.startsWith("Bearer ")) {
    return next(new AppError("unauthorized", "Invalid access token."));
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return next(new AppError("unauthorized", "Invalid access token."));
  }

  try {
    const data = jwt.verify(
      token,
      NODE_JWT_SECRET_KEY as string
    ) as Session["user"];

    res.session.user = data;
    next();
  } catch {
    return next(new AppError("forbidden", "Token expired or invalid."));
  }
}

export function originResolver(
  origin: string | undefined,
  callback: (err: Error | null, origin?: StaticOrigin) => void
) {
  if (ALLOWED_ORIGINS.indexOf(origin as string) !== -1) {
    callback(null, true);
  } else if (!origin) {
    return callback(null, true);
  }

  return callback(new AppError("badRequest", "Not allowed by CORS"));
}

export function errorFallback(
  err: Error,
  _: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  res.status("statusCode" in err ? (err.statusCode as number) : 500).json({
    message: err instanceof AppError ? err.message : "Internal Server Error",
  });
}

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request<unknown>, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const invalids = err.issues.map((issue) => issue.path.pop());
        next(
          new AppError(
            "validation",
            `Invalid or missing input${
              invalids.length > 1 ? "s" : ""
            } provided for: ${invalids.join(", ")}`
          )
        );
      } else {
        next(new AppError("validation", "Invalid input"));
      }
    }
  };
