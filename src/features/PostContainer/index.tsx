'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post_type } from './types/Post_type';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReplyContainer from './components/ReplyContainer';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ArrowUp, ArrowDown, MessageCircle, Calendar } from 'lucide-react';

interface PostProps extends Post_type {
  userId?: string | null;
}

export default function Post({ userId, ...post }: PostProps) {
  const [showReply, setShowReply] = useState(false);
  const router = useRouter();

  const handleReplyClick = () => {
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

  const setOptimisticReply = () => {
    setShowReply(false);
  };

  return (
    <div className='mb-3'>
      <Card
        className={`gap-3 py-4 shadow-sm ${showReply && userId ? 'mb-0 rounded-b-none' : ''}`}
      >
        <CardHeader className='px-4'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex gap-3'>
              <Avatar>
                <AvatarImage src='https://tribuna.md/wp-content/uploads/2021/01/utm.jpg' />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              {post.title && (
                <CardTitle className='text-xl font-bold'>
                  {post.title}
                </CardTitle>
              )}
            </div>

            {post.authorName && (
              <span className='text-sm text-gray-500'>
                by {post.authorName}
              </span>
            )}
          </div>
        </CardHeader>

        <CardDescription className='px-4 py-1'>{post.content}</CardDescription>

        <div className='flex justify-between px-4 py-2 text-xs text-gray-500'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            {post.createdAt && new Date(post.createdAt).toLocaleDateString()}
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={handleReplyClick}
              className='flex cursor-pointer items-center gap-1 hover:text-black'
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
      </Card>

      {userId && showReply && (
        <ReplyContainer
          postId={post.id}
          authorId={userId}
          setOptimisticReply={setOptimisticReply}
        />
      )}
    </div>
  );
}
