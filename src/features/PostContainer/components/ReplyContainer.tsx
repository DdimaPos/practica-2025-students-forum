'use client';

import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { CommentType } from '@/features/CommentsContainer/types/Comment_type';
import { useRouter } from 'next/navigation';

interface ReplyFormProps {
  postId: string;
  authorId: string;
  parentCommentId?: string | null;
  setOptimisticReply?: (reply: CommentType) => void;
  replaceOptimisticReply?: (tempId: string, realComment: CommentType) => void;
}

export default function ReplyContainer({
  postId,
  authorId,
  parentCommentId = null,
  setOptimisticReply,
  replaceOptimisticReply,
}: ReplyFormProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!message.trim()) return;

    const tempId = String(Date.now());
    const optimisticReply: CommentType = {
      id: tempId,
      postId,
      authorId,
      parentComment: parentCommentId || null,
      content: message.trim(),
      isAnonymous: false,
      createdAt: new Date(),
      authorName: 'You',
      authorFirstName: null,
      authorLastName: null,
      authorUserType: null,
      authorProfilePictureUrl: null,
    };

    setOptimisticReply?.(optimisticReply);
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

      // Get the real comment data from API response
      const responseData = await res.json();

      if (responseData.comment && replaceOptimisticReply) {
        // Replace optimistic comment with real data
        const realComment = {
          ...responseData.comment,
          authorName: 'You', // Keep the current user's name
        };
        replaceOptimisticReply(tempId, realComment);
      } else {
        window.location.reload();
      }
      router.refresh();
    } catch (err: unknown) {
      Sentry.captureException(err, {
        tags: { component: 'ReplyContainer', operation: 'submitComment' },
        extra: { post_id: postId, parent_comment_id: parentCommentId },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-card rounded-b-xl border border-t-0 p-3 shadow-sm'>
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
