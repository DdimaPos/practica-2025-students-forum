'use client';

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
import Link from 'next/link';
import {FC, useActionState, useEffect} from 'react';
import {OAuthGroup} from './OAuthGroup';

import {useFormStatus} from 'react-dom';
import type {FormState} from '../actions/login';
import {Toaster} from '@/components/ui/sonner';
import {toast} from 'sonner';

interface Props {
  onSubmit: (prevState: FormState, formData: FormData) => Promise<FormState>;
}

function SubmitButton() {
  const {pending} = useFormStatus();
  return (
    <Button
      type='submit'
      form='loginform'
      className='w-full'
      disabled={pending}
    >
      {pending ? 'Logging in...' : 'Login'}
    </Button>
  );
}

export const LoginForm: FC<Props> = ({onSubmit}) => {
  const initialState: FormState = {success: false, message: ''};
  const [state, formAction] = useActionState(onSubmit, initialState);

  useEffect(() => {
    if (!state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Card className='w-full max-w-sm'>
      <Toaster richColors />
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
        <form id='loginform' action={formAction}>
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
        <SubmitButton />
        <Separator />
        <OAuthGroup />
      </CardFooter>
    </Card>
  );
};
