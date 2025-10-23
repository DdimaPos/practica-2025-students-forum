'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { enrollMFA } from '../actions/enrollMFA';
import { createMfaChallenge } from '../actions/createMFAChallenge';
import { verifyMFA } from '../actions/verifyMFA';

export function EnrollMFA() {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function handleEnroll() {
    try {
      const data = await enrollMFA();
      setFactorId(data.factorId);
      setQrCode(data.qrCode);
      setSecret(data.secret);

      const challenge = await createMfaChallenge(data.factorId);
      setChallengeId(challenge.challengeId);

      setMessage(
        'Scan the QR code with your authenticator app and enter the code.'
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage('An unexpected error occurred during MFA enrollment.');
      }
    }
  }

  async function handleVerify() {
    if (!factorId || !challengeId) return;

    const result = await verifyMFA({ factorId, challengeId, code });
    setMessage(result.message);
  }

  return (
    <div className='mx-auto mt-10 flex max-w-md flex-col gap-4'>
      <h1 className='text-xl font-bold'>Enroll MFA</h1>

      {!factorId && (
        <Button onClick={handleEnroll}>Start MFA Enrollment</Button>
      )}

      {qrCode && (
        <div className='flex flex-col gap-2'>
          <p>Scan this QR code with your authenticator app:</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCode} alt='MFA QR Code' className='rounded border' />
          <p>If you can’t scan, enter this secret manually:</p>
          <code className='rounded bg-gray-100 p-2'>{secret}</code>
        </div>
      )}

      {challengeId && (
        <div className='flex flex-col gap-2'>
          <Input
            placeholder='Enter 6-digit code'
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <Button onClick={handleVerify}>Verify</Button>
        </div>
      )}

      {message && <p className='text-sm text-gray-700'>{message}</p>}
    </div>
  );
}
