'use client';

import { useState } from 'react';
import CommentThread from './CommentThread';
import type { CommentType } from '../types/Comment_type';

type CommentWithMeta = CommentType & { repliesCount: number; rating: number };

export default function CommentSectionClient({
  postId,
  initialComments,
  total,
  userId,
}: {
  postId: string;
  initialComments: CommentWithMeta[];
  total: number;
  userId?: string;
}) {
  const [comments, setComments] = useState(initialComments);
  const [offset, setOffset] = useState(initialComments.length);
  const [loading, setLoading] = useState(false);

  const limit = 5;

  async function loadMore() {
    setLoading(true);
    const res = await fetch(
      `/api/parentComments?postId=${postId}&limit=${limit}&offset=${offset}`
    );
    const data: { comments: CommentWithMeta[]; total: number } =
      await res.json();

    setComments(prev => [...prev, ...data.comments]);
    setOffset(prev => prev + data.comments.length);
    setLoading(false);
  }

  if (comments.length === 0) {
    return (
      <div className='flex h-24 items-center justify-center'>
        <p className='text-muted-foreground text-3xl'>
          Be the first to comment!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className='border-l-2 border-gray-200'>
        {comments.map(c => (
          <CommentThread
            key={c.id}
            postId={postId}
            comment={c}
            authorId={userId}
          />
        ))}
      </div>

      {total > comments.length && (
        <p className='mt-4 text-center text-sm text-gray-500'>
          Showing {comments.length} of {total} comments.
          <button
            className='ml-2 text-blue-600 hover:underline disabled:opacity-50'
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </p>
      )}
    </div>
  );
}
