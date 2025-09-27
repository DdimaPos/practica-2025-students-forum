'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { verifyMFA } from '../actions/verifyMFA';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

interface Props {
  factorId: string;
  challengeId: string;
}

const FormSchema = z.object({
  pin: z
    .string()
    .length(6, {
      message: 'Your one-time password must be exactly 6 digits.',
    })
    .regex(/^\d+$/, { message: 'Must contain only numbers' }),
});

export function MFAForm({ factorId, challengeId }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { pin: '' },
  });

  async function handleSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    setError(null);

    const result = await verifyMFA({
      factorId,
      challengeId,
      code: data.pin,
    });

    if (!result.success) {
      toast.error(result.message);
      setLoading(false);

      return;
    }

    router.push('/');
  }

  return (
    <Card>
      <Toaster richColors position='top-center' />
      <CardHeader>
        <CardTitle>Multi-Factor Authentication</CardTitle>
        <CardDescription>
          Please enter the 6-digit verification code from your authenticator
          app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='w-full space-y-6'
          >
            <FormField
              control={form.control}
              name='pin'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='justify-self-center'>
                    One-Time Password
                  </FormLabel>
                  <FormControl>
                    <div className='flex justify-center'>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormDescription className='justify-self-center'>
                    Enter the 6-digit code from your authenticator app.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p className='text-sm text-red-600'>{error}</p>}

            <Button type='submit' disabled={loading} className='w-full'>
              {loading ? 'Verifying…' : 'Submit'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
