'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ReplyFormProps {
  postId: number;
  authorId: number;
  parentCommentId?: number | null;
}

export default function ReplyContainer({
  postId,
  authorId,
  parentCommentId = null,
}: ReplyFormProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          authorId,
          parentCommentId: parentCommentId || null,
          content: message.trim(),
          isAnonymous: false,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || 'Failed to send comment');
      }

      setMessage('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mt-4 flex flex-col gap-2 rounded-lg border border-gray-300 bg-white p-3'>
      <Textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        className='w-full flex-1 resize-none overflow-y-auto'
        placeholder='Write a reply...'
        disabled={loading}
      />

      <div className='flex items-center justify-end gap-2'>
        <Button
          onClick={handleSubmit}
          className='cursor-pointer p-2'
          disabled={loading}
        >
          <Send className='h-5 w-5' />
        </Button>
      </div>

      {success && (
        <Alert className='border-green-500 bg-green-50 text-green-700'>
          <CheckCircle2 className='h-4 w-4' />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Comment added successfully!</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className='border-red-500 bg-red-50 text-red-700'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
