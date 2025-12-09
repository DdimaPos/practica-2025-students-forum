'use client';

import Link from 'next/link';
import { FC, useActionState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';

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
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  onSubmit: (prevState: FormState, formData: FormData) => Promise<FormState>;
  userEmail?: string;
}

export const ReauthForm: FC<Props> = ({ onSubmit, userEmail }) => {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/settings/account';

  const initialState: FormState = { success: false, message: '' };
  const [state, formAction] = useActionState(onSubmit, initialState);

  const [isPending, startTransition] = useTransition();

  useFormStateToast(state, '');

  const formActionWithTransition = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card className='w-full max-w-md'>
      <Toaster richColors position='top-center' />
      <CardHeader>
        <CardTitle>Confirm your identity</CardTitle>
        <CardDescription>
          For your security, please re-enter your password to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.message && !state.success && (
          <Alert variant='destructive' className='mb-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        <form id='reauthform' action={formActionWithTransition}>
          <input type='hidden' name='redirectTo' value={redirectTo} />
          <div className='flex flex-col gap-6'>
            {userEmail && (
              <div className='grid gap-2'>
                <Label>Email</Label>
                <div className='bg-muted text-muted-foreground rounded-md px-3 py-2 text-sm'>
                  {userEmail}
                </div>
              </div>
            )}
            <div className='grid gap-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                name='password'
                type='password'
                required
                autoFocus
                placeholder='Enter your password'
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className='flex flex-col gap-4'>
        <Button
          type='submit'
          form='reauthform'
          className='w-full'
          disabled={isPending}
        >
          {isPending ? 'Confirming...' : 'Confirm'}
        </Button>
        <div className='text-muted-foreground text-center text-sm'>
          <Link
            href='/forgot-password'
            className='underline-offset-4 hover:underline'
          >
            Forgot your password?
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};
