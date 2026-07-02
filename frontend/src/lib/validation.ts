import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('請輸入有效的 Email').toLowerCase(),
  password: z.string().min(1, '請輸入密碼'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
