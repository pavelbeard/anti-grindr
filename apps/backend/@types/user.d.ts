import type { Session } from "../src/types/user.ts";

declare global {
  namespace Express {
    export interface Response {
      session: Session;
    }
  }
}
