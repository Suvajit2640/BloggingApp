import { z } from "zod";

export const signupUser = z.object({
  userName: z
    .string()
    .min(4, { message: "Username must be at least 4 characters long" }),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 characters" })
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must contain at least one number",
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
      message: "Password must contain at least one special character",
    }),
});

export const signinUser = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 characters" })
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must contain at least one number",
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
      message: "Password must contain at least one special character",
    }),
});

export const notesvalidation = z.object({
  title: z
    .string()
    .min(3, { message: "title must be at least 3 characters long" }),
  content: z.string().min(1, { message: "content cannot be null" }),
});
