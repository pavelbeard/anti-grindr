import { ALLOWED_ORIGINS } from "@/settings.ts";
import { StaticOrigin } from "@/types/cors-middleware.ts";

export function originResolver(
  origin: string | undefined,
  callback: (err: Error | null, origin?: StaticOrigin) => void
) {
  if (ALLOWED_ORIGINS.indexOf(origin as string) !== -1) {
    callback(null, true);
  } else if (!origin) {
    return callback(null, true);
  }

  return callback(new Error("Not allowed by CORS"));
}
