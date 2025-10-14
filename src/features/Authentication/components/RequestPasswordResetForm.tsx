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
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';

interface Props {
  onSubmit: (prevState: FormState, formData: FormData) => Promise<FormState>;
}

export const RequestPasswordResetForm: FC<Props> = ({ onSubmit }) => {
  const initialState: FormState = { success: false, message: '' };
  const [state, formAction] = useActionState(onSubmit, initialState);

  const [isPending, startTransition] = useTransition();

  useFormStateToast(
    state,
    'If your account exists, check your email for a password reset link.'
  );

  const formActionWithTransition = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card className='w-full max-w-md'>
      <Toaster richColors position='top-center' />
      <CardHeader>
        <CardTitle>Forgot your password?</CardTitle>
        <CardDescription>
          Enter your email address and we’ll send you a password reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id='reset-request-form' action={formActionWithTransition}>
          <div className='flex flex-col gap-6'>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                name='email'
                placeholder='mail@example.com'
                required
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className='flex-col gap-2'>
        <Button
          type='submit'
          form='reset-request-form'
          className='w-full'
          disabled={isPending}
        >
          {isPending ? 'Sending...' : 'Send Reset Link'}
        </Button>
        <Separator />
      </CardFooter>
    </Card>
  );
};
