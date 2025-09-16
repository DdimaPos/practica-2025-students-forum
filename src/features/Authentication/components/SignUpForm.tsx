'use client';
import {FC, useActionState, useTransition} from 'react';
import type {FormState} from '../types';
import Link from 'next/link';
import {useFormStateToast} from '../hooks/useToast';
import {TermsAndConditions} from './TermsAndConditions';

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
import {Separator} from '@/components/ui/separator';
import {OAuthGroup} from './OAuthGroup';

interface Props {
  onSubmit: (prevState: FormState, formData: FormData) => Promise<FormState>;
}

export const SignUpForm: FC<Props> = ({onSubmit}) => {
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
              <Label htmlFor='username' className='text-right'>
                Username
              </Label>
              <Input
                id='username'
                type='text'
                name='username'
                placeholder='ion_moraru'
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
              <Label htmlFor='picture' className='text-right'>
                Profile Pic
              </Label>
              <Input className='bg-accent' id='picture' type='file' />
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
