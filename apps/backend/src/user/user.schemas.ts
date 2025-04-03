import { z } from 'zod'

const PasswordSchema = z
  .string({
    required_error: 'Password is required'
  })
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(32, { message: 'Password must be at most 32 characters long' })
  .regex(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter'
  })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[^A-Za-z0-9]/, {
    message: 'Password must contain at least one symbol'
  })

const CreateUserSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required'
      })
      .email()
      .min(8, { message: 'Email must be at least 8 characters long' }),
    password: PasswordSchema
  })
})

const UpdateEmailSchema = z.object({
  body: z.object({
    newEmail: z
      .string()
      .email()
      .min(8, { message: 'Email must be at least 8 characters long' }),
    actualPassword: z.string()
  }),
  params: z.object({
    id: z.string()
  })
})

const UpdatePasswordSchema = z.object({
  body: z
    .object({
      actualPassword: z.string(),
      newPassword: PasswordSchema,
      repeatNewPassword: PasswordSchema
    })
    .refine((data) => data.newPassword === data.repeatNewPassword, {
      message: "Passwords don't match",
      path: ['repeatNewPassword']
    }),
  params: z.object({
    id: z.string()
  })
})

const DeleteAccountSchema = z.object({
  body: z.object({
    password: z.string()
  }),
  params: z.object({
    id: z.string()
  })
})

const SignInUserSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required'
      })
      .email()
      .min(8, { message: 'Email must be at least 8 characters long' }),
    password: PasswordSchema
  })
})

const RefreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string()
  })
})

export {
  CreateUserSchema,
  DeleteAccountSchema,
  RefreshTokenSchema,
  SignInUserSchema,
  UpdateEmailSchema,
  UpdatePasswordSchema
}
