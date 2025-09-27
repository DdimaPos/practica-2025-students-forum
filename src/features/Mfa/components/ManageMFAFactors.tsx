'use client';

import { useState } from 'react';
import { unenrollMFA } from '../actions/unenrollMFA';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

interface Props {
  factors: { id: string; friendlyName?: string }[];
}

export function ManageMFAFactors({ factors }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove(factorId: string) {
    setLoadingId(factorId);
    setError(null);

    const result = await unenrollMFA(factorId);

    if (!result.success) {
      setError(result.message);
    } else {
      window.location.reload();
    }

    setLoadingId(null);
  }

  if (factors.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className='text-muted-foreground'>No MFA factors enrolled yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <Toaster richColors position='bottom-right' />
      {factors.map(factor => (
        <Card key={factor.id}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0'>
            <CardTitle className='text-base font-medium'>
              {factor.friendlyName ?? `Factor ${factor.id}`}
            </CardTitle>
            <Button
              variant='destructive'
              size='sm'
              onClick={() => handleRemove(factor.id)}
              disabled={loadingId === factor.id}
            >
              {loadingId === factor.id ? 'Removing…' : 'Remove'}
            </Button>
          </CardHeader>
        </Card>
      ))}

      {error && toast.error(error)}
    </div>
  );
}
