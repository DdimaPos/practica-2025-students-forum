'use client';

import { verifyMFA } from '@/features/Authentication/actions/verifyMFA';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  factorId: string;
  challengeId: string;
}

export function MFAForm({ factorId, challengeId }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await verifyMFA({ factorId, challengeId, code });

    if (!result.success) {
      setError(result.message);
    } else {
      // ✅ Redirect on success
      router.push('/');
      return;
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <input
        type='text'
        name='code'
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder='Enter 6-digit code'
        className='w-full rounded border p-2'
        maxLength={6}
        required
      />
      {error && <p className='text-sm text-red-600'>{error}</p>}
      <button
        type='submit'
        disabled={loading}
        className='w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50'
      >
        {loading ? 'Verifying…' : 'Verify'}
      </button>
    </form>
  );
}
