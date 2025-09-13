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
import {Toaster} from '@/components/ui/sonner';
import {toast} from 'sonner';
import {FC, useActionState, useEffect} from 'react';
import {FormState} from '../actions/login';
import {useFormStatus} from 'react-dom';
import Link from 'next/link';

interface Props {
  onSubmit: (prevState: FormState, formData: FormData) => Promise<FormState>;
}

export const SignUpForm: FC<Props> = ({onSubmit}) => {
  const initialState: FormState = {success: false, message: ''};
  const {pending} = useFormStatus();
  const [state, formAction] = useActionState(onSubmit, initialState);

  useEffect(() => {
    if (!state.success && state.message) {
      toast.error(state.message);
    }

    if (state.success) {
      toast.success(state.message || 'Signed in. Check your email');
    }
  }, [state]);
  return (
    <Card className='w-full max-w-sm'>
      <Toaster richColors />
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
        <Button
          type='submit'
          form='loginform'
          className='w-full'
          disabled={pending}
        >
          {pending ? 'Signing in...' : 'Sign in'}
        </Button>
      </CardFooter>
    </Card>
  );
};
