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
  authorId: number | null;
}) {
  const [replies, setReplies] = useState<CommentType[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const router = useRouter();

  const loadReplies = async () => {
    const res = await fetch(`/api/comments/${comment.id}/replies`);
    const data = await res.json();
    setReplies(data.comments);
    setLoaded(true);
  };

  const handleReplyClick = () => {
    if (!authorId) {
      router.push('/login');

      return;
    }
    setShowReply(prev => !prev);
  };

  return (
    <div className='ml-6'>
      <CommentCard comment={comment} onReplyClick={handleReplyClick} />

      {showReply && authorId && (
        <ReplyContainer
          postId={postId}
          authorId={authorId}
          parentCommentId={comment.id}
        />
      )}

      {comment.repliesCount && comment.repliesCount > 0 && !loaded && (
        <p className='mb-3 text-center text-sm text-gray-500'>
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

      {loaded && (
        <div className='border-l-2 border-gray-200 pl-4'>
          {replies.map(r => (
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
  );
}
