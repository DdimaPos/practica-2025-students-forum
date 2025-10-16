'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CommentCard from './CommentCard';
import ReplyContainer from '@/features/PostContainer/components/ReplyContainer';
import { CommentType } from '../types/Comment_type';

export default function CommentThread({
  comment,
  postId,
  authorId,
}: {
  comment: CommentType & { repliesCount?: number; rating?: number };
  postId: number;
  authorId?: number;
}) {
  const [replies, setReplies] = useState<CommentType[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [optimisticReplies, setOptimisticReplies] = useState<CommentType[]>([]);
  const router = useRouter();

  const loadReplies = async () => {
    const res = await fetch(`/api/comments/${comment.id}/replies`);
    const data = await res.json();
    setReplies(data.comments);
    setLoaded(true);
  };

  const setOptimisticReply = (optimisticReply: CommentType) => {
    setOptimisticReplies(prev => [...prev, optimisticReply]);
  };

  const handleReplyClick = () => {
    if (!authorId) {
      router.push('/login');

      return;
    }
    setShowReply(prev => !prev);
  };

  const allReplies = [...optimisticReplies, ...replies];

  return (
    <div className='ml-6'>
      <div className='mb-3'>
        <CommentCard
          comment={comment}
          onReplyClick={handleReplyClick}
          hasReplyAttached={showReply && !!authorId}
        />

        {showReply && authorId && (
          <ReplyContainer
            postId={postId}
            authorId={authorId}
            parentCommentId={comment.id}
            setOptimisticReply={setOptimisticReply}
          />
        )}
      </div>

      <div className='flex flex-col gap-3'>
        {comment.repliesCount &&
          comment.repliesCount > 0 &&
          !loaded &&
          optimisticReplies.length === 0 && (
            <p className='text-center text-sm text-gray-500'>
              Show {comment.repliesCount} repl
              {comment.repliesCount === 1 ? 'y' : 'ies'}
              <button
                onClick={loadReplies}
                className='ml-2 text-blue-600 hover:underline'
              >
                Load replies
              </button>
            </p>
          )}

        {(loaded || optimisticReplies.length > 0) && (
          <div className='border-l-2 border-gray-200 pl-0'>
            {allReplies.map(r => (
              <CommentThread
                key={r.id}
                comment={r}
                postId={postId}
                authorId={authorId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
