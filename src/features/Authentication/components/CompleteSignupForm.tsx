'use client';

import { FC, useActionState, useTransition } from 'react';
import type { FormState } from '../types';
import { useFormStateToast } from '../hooks/useToast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';

interface Props {
  onSubmit: (prevState: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: {
    firstName?: string;
    lastName?: string;
  };
}

export const CompleteSignupForm: FC<Props> = ({ onSubmit, defaultValues }) => {
  const initialState: FormState = { success: false, message: '' };
  const [state, formAction] = useActionState(onSubmit, initialState);

  const [isPending, startTransition] = useTransition();

  useFormStateToast(state, 'Profile completed successfully.');

  const formActionWithTransition = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card className='w-full max-w-md'>
      <Toaster richColors position='top-center' />
      <CardHeader>
        <CardTitle>Complete your profile</CardTitle>
        <CardDescription>
          Please fill in the remaining details to finish setting up your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id='complete-signup-form' action={formActionWithTransition}>
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
                defaultValue={defaultValues?.firstName}
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
                defaultValue={defaultValues?.lastName}
                required
              />
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
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type='submit'
          form='complete-signup-form'
          className='w-full'
          disabled={isPending}
        >
          {isPending ? 'Saving...' : 'Complete signup'}
        </Button>
      </CardFooter>
    </Card>
  );
};
