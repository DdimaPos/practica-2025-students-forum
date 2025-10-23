'use client';

import { FC, useActionState, useEffect, useTransition } from 'react';

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
import { logout } from '../actions/logout';

interface Props {
  onSubmit: (prevState: FormState, formData: FormData) => Promise<FormState>;
}

export const UpdatePasswordForm: FC<Props> = ({ onSubmit }) => {
  const initialState: FormState = { success: false, message: '' };
  const [state, formAction] = useActionState(onSubmit, initialState);

  const [isPending, startTransition] = useTransition();

  useFormStateToast(state, 'Password reset successfully');

  useEffect(() => {
    if (state.success) {
      setTimeout(() => {
        logout();
      }, 3000);
    }
  }, [state]);

  const formActionWithTransition = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card className='w-full max-w-md'>
      <Toaster richColors position='top-center' />
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>
          Enter below your new password that you will use to login
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id='loginform' action={formActionWithTransition}>
          <div className='flex flex-col gap-6'>
            <div className='grid gap-2'>
              <Label htmlFor='email'>New password</Label>
              <Input id='password' name='password' type='password' required />
            </div>
            <div className='grid gap-2'>
              <div className='flex items-center'>
                <Label htmlFor='password'>Confirm password</Label>
              </div>
              <Input
                id='passwordConfirmation'
                name='passwordConfirmation'
                type='password'
                required
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className='flex-col gap-2'>
        <Button
          type='submit'
          form='loginform'
          className='w-full'
          disabled={isPending}
        >
          {isPending ? 'Reseting...' : 'Reset'}
        </Button>
        <Separator />
      </CardFooter>
    </Card>
  );
};
