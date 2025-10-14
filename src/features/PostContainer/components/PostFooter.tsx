'use client';

import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown, MessageCircle, Calendar } from 'lucide-react';
import { Post_type } from '../types/Post_type';
import ReplyContainer from './ReplyContainer';
import { useState } from 'react';

export default function Footer({
  post,
  userId,
}: {
  post: Post_type;
  userId: number | null;
}) {
  const [showReply, setShowReply] = useState(false);
  const router = useRouter();

  const handleMessage = () => {
    if (!userId) {
      router.push('/login');

      return;
    }
    setShowReply(prev => !prev);
  };

  const handleUpvote = () => {
    console.log('Upvote clicked for post', post.id);
  };

  const handleDownvote = () => {
    console.log('Downvote clicked for post', post.id);
  };

  return (
    <div className='w-full'>
      <div className='flex justify-between px-4 py-2 text-sm text-gray-500'>
        <div className='flex items-center gap-2'>
          <Calendar className='h-4 w-4' />
          {post.createdAt && new Date(post.createdAt).toLocaleDateString()}
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={handleMessage}
            className='flex w-25 cursor-pointer items-center gap-2 hover:text-black'
          >
            <MessageCircle className='h-4 w-4' />
            <span>Reply</span>
          </button>

          <button
            onClick={handleUpvote}
            className='cursor-pointer hover:text-green-500'
          >
            <ArrowUp className='h-4 w-4' />
          </button>
          <span>{post.rating ?? 0}</span>
          <button
            onClick={handleDownvote}
            className='cursor-pointer hover:text-red-500'
          >
            <ArrowDown className='h-4 w-4' />
          </button>
        </div>
      </div>

      {userId && showReply && (
        <ReplyContainer postId={post.id} authorId={userId} />
      )}
    </div>
  );
}
