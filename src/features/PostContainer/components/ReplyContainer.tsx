'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { CommentType } from '@/features/CommentsContainer/types/Comment_type';

interface ReplyFormProps {
  postId: number;
  authorId: number;
  parentCommentId?: number | null;
  setOptimisticReply?: (reply: CommentType) => void;
}

export default function ReplyContainer({
  postId,
  authorId,
  parentCommentId = null,
  setOptimisticReply,
}: ReplyFormProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    // Create optimistic reply
    const optimisticReply = {
      id: Date.now(), // Temporary ID
      postId,
      authorId,
      parentComment: parentCommentId || null,
      content: message.trim(),
      isAnonymous: false,
      createdAt: new Date(),
      authorName: 'You', // Will be replaced when real data comes back
    };

    // Call optimistic update immediately
    setOptimisticReply?.(optimisticReply);
    setMessage('');

    setLoading(true);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          authorId,
          parentCommentId: parentCommentId || null,
          content: optimisticReply.content,
          isAnonymous: false,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || 'Failed to send comment');
      }
    } catch (err: unknown) {
      console.error(err);
      // Could add toast notification here instead of alert
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='rounded-b-lg border border-t-0 border-gray-200 bg-white p-3 shadow-sm'>
      <div className='flex gap-2'>
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
      </div>
    </div>
  );
}
