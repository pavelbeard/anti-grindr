import { IProfileNotFoundError } from "@/types/profile.ts";

export class ProfileNotFoundError
  extends Error
  implements IProfileNotFoundError
{
  name: string;

  constructor(
    name: string = "ProfileNotFoundError",
    message: string | "Profile not found" = "Profile not found"
  ) {
    super(message);
    this.name = name;
  }
}
