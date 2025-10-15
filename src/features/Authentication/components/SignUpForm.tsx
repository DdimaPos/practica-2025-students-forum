'use client';
import { FC, useActionState, useTransition } from 'react';
import type { FormState } from '../types';
import Link from 'next/link';
import { useFormStateToast } from '../hooks/useToast';
import { TermsAndConditions } from './TermsAndConditions';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import { Separator } from '@/components/ui/separator';
import { OAuthGroup } from './OAuthGroup';

interface Props {
  onSubmit: (prevState: FormState, formData: FormData) => Promise<FormState>;
}

export const SignUpForm: FC<Props> = ({ onSubmit }) => {
  const initialState: FormState = { success: false, message: '' };
  const [state, formAction] = useActionState(onSubmit, initialState);

  const [isPending, startTransition] = useTransition();

  useFormStateToast(state, 'Signed up. Check your email for verification.');

  const formActionWithTransition = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card className='w-full max-w-md'>
      <Toaster richColors position='top-center' />
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Enter your email below to create your account
        </CardDescription>
        <CardAction>
          <Link href='/login'>
            <Button variant='link'>Log in</Button>
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form id='signupform' action={formActionWithTransition}>
          <div className='grid gap-8'>
            <div className='grid grid-cols-[100px_1fr] items-center gap-2'>
              <Label htmlFor='firstName' className='text-right'>
                First Name
              </Label>
              <Input
                id='firstName'
                type='text'
                name='firstName'
                placeholder='Ion'
                required
              />
            </div>

            <div className='grid grid-cols-[100px_1fr] items-center gap-2'>
              <Label htmlFor='lastName' className='text-right'>
                Last Name
              </Label>
              <Input
                id='lastName'
                type='text'
                name='lastName'
                placeholder='Moraru'
                required
              />
            </div>

            <div className='grid grid-cols-[100px_1fr] items-center gap-2'>
              <Label htmlFor='email' className='text-right'>
                Email
              </Label>
              <Input
                id='email'
                type='email'
                name='email'
                placeholder='mail@example.com'
                required
              />
            </div>

            <div className='grid grid-cols-[100px_1fr] items-center gap-2'>
              <Label htmlFor='password' className='text-right'>
                Password
              </Label>
              <Input id='password' name='password' type='password' required />
            </div>

            <div className='grid grid-cols-[100px_1fr] items-center gap-2'>
              <Label htmlFor='userType' className='text-right'>
                User Type
              </Label>
              <select
                id='userType'
                name='userType'
                className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                defaultValue='student'
              >
                <option value='student'>Student</option>
                <option value='professor'>Professor</option>
              </select>
            </div>

            <div className='grid grid-cols-[100px_1fr] items-center gap-2'>
              <Label htmlFor='yearOfStudy' className='text-right'>
                Year of Study
              </Label>
              <Input
                id='yearOfStudy'
                type='number'
                name='yearOfStudy'
                placeholder='1'
                min='1'
                max='5'
              />
            </div>

            <div className='grid grid-cols-[100px_1fr] items-center gap-2'>
              <Label htmlFor='bio' className='text-right'>
                Bio
              </Label>
              <Input
                id='bio'
                type='text'
                name='bio'
                placeholder='Tell us about yourself...'
              />
            </div>

            <div className='grid grid-cols-[100px_1fr] items-center gap-2'>
              <Label htmlFor='picture' className='text-right'>
                Profile Pic
              </Label>
              <Input
                className='bg-accent'
                id='picture'
                name='picture'
                type='file'
                accept='image/*'
                onChange={e => {
                  const file = e.target.files?.[0];

                  if (file && file.size > 1024 * 1024) {
                    alert('File size must be less than 1MB');
                    e.target.value = '';
                  }
                }}
              />
            </div>
            <TermsAndConditions />
          </div>
        </form>
      </CardContent>
      <CardFooter className='flex-col gap-2'>
        <Button
          type='submit'
          form='signupform'
          className='w-full'
          disabled={isPending}
        >
          {isPending ? 'Creating account...' : 'Create account'}
        </Button>
        <Separator />
        <OAuthGroup />
      </CardFooter>
    </Card>
  );
};
