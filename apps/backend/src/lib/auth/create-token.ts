import { JWT_TOKEN_EXPIRATION_TIME, NODE_JWT_SECRET_KEY } from "@/settings.ts";
import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

export default function createToken(payload: {
  email: User["email"];
  id: User["id"];
}) {
  return jwt.sign(payload, NODE_JWT_SECRET_KEY as string, {
    expiresIn: JWT_TOKEN_EXPIRATION_TIME,
  });
}
