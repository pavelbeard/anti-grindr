import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[^A-Za-z0-9]/, {
    message: "Password must contain at least one symbol",
  });

const createUserSchema = z.object({
  email: z
    .string()
    .email()
    .min(8, { message: "Email must be at least 8 characters long" }),
  password: passwordSchema,
});

const updateEmailSchema = z.object({
  newEmail: z
    .string()
    .email()
    .min(8, { message: "Email must be at least 8 characters long" }),
  actualPassword: z.string(),
});

const updatePasswordSchema = z
  .object({
    actualPassword: z.string(),
    newPassword: passwordSchema,
    repeatNewPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.repeatNewPassword, {
    message: "Passwords don't match",
    path: ["repeatNewPassword"],
  });

const signInUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export {
  createUserSchema,
  signInUserSchema,
  updateEmailSchema,
  updatePasswordSchema,
};
