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
  userType: z.enum(['student', 'professor']).optional(),
  bio: z.string().optional(),
  yearOfStudy: z
    .string()
    .transform(val => (val ? parseInt(val, 10) : undefined))
    .refine(val => val === undefined || (val >= 1 && val <= 5), {
      message: 'Year of study must be between 1 and 5',
    })
    .optional(),
  password: z.string().min(passwordLength, {
    message: `Password must be at least ${passwordLength} characters long`,
  }),
});

export type SignupFormData = z.infer<typeof signupFormSchema>;

export enum ProviderTypes {
  GOOGLE = 'google',
  GITHUB = 'github',
  AZURE = 'azure',
}
