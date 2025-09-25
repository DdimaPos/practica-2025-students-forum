'use client';

import { unenrollMFA } from '@/features/Authentication/actions/unenrollMFA';
import { useState } from 'react';

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
      // Refresh the page to reload factors
      window.location.reload();
    }

    setLoadingId(null);
  }

  if (factors.length === 0) {
    return <p>No MFA factors enrolled yet.</p>;
  }

  return (
    <ul className='space-y-4'>
      {factors.map(factor => (
        <li
          key={factor.id}
          className='flex items-center justify-between rounded border p-3'
        >
          <span>{factor.friendlyName ?? `Factor ${factor.id}`}</span>
          <button
            onClick={() => handleRemove(factor.id)}
            disabled={loadingId === factor.id}
            className='rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50'
          >
            {loadingId === factor.id ? 'Removing…' : 'Remove'}
          </button>
        </li>
      ))}
      {error && <p className='text-sm text-red-600'>{error}</p>}
    </ul>
  );
}
