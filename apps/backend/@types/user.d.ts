import type { Session } from "../src/user/user.types.ts";

declare global {
  namespace Express {
    export interface Response {
      session: Session;
    }
  }
}
