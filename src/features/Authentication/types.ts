import { z } from 'zod';
export type FormState = {
  success: boolean;
  message: string;
};

const passwordLength = 6;

export const signupFormSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  userType: z.enum(['student', 'professor', 'admin']).optional(),
  bio: z.string().optional(),
  yearOfStudy: z
    .number()
    .min(1, { message: 'Year of study must be at least 1' })
    .max(5, { message: 'Year of study must be at most 5' })
    .optional(),
  password: z
    .string()
    .min(
      passwordLength,
      { message: `Password must be at least ${passwordLength} characters long` }
    ),
})

export type SignupFormData = z.infer<typeof signupFormSchema>;

export enum ProviderTypes {
  GOOGLE = 'google',
  GITHUB = 'github',
  AZURE = 'azure',
}
