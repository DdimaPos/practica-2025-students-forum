'use client';

import Link from 'next/link';
import {FC, useActionState, useTransition} from 'react';
import {OAuthGroup} from './OAuthGroup';

import type {FormState} from '../types';
import {useFormStateToast} from '../hooks/useToast';

import {Button} from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';
import {Toaster} from '@/components/ui/sonner';

interface Props {
  onSubmit: (prevState: FormState, formData: FormData) => Promise<FormState>;
}

export const LoginForm: FC<Props> = ({onSubmit}) => {
  const initialState: FormState = {success: false, message: ''};
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
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Link href='/register'>
            <Button variant='link'>Sign Up</Button>
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form id='loginform' action={formActionWithTransition}>
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
            <div className='grid gap-2'>
              <div className='flex items-center'>
                <Label htmlFor='password'>Password</Label>
                <a
                  href='#'
                  className='ml-auto inline-block text-sm underline-offset-4 hover:underline'
                >
                  Forgot your password?
                </a>
              </div>
              <Input id='password' name='password' type='password' required />
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
          {isPending ? 'Logging in...' : 'Login'}
        </Button>
        <Separator />
        <OAuthGroup />
      </CardFooter>
    </Card>
  );
};
