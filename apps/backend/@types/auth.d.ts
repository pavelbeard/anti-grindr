import type { Session } from "../src/types/auth.ts";

declare global {
  namespace Express {
    export interface Response {
      session: Session;
    }
  }
}
