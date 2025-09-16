'use client';

import {Post_type} from '@/features/Post/types/Post_type';
import {Calendar, ArrowUp, ArrowDown, MessageCircle} from 'lucide-react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {useState} from 'react';
import ReplyForm from './components/ReplyForm';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

export default function Post({...post}: Post_type) {
  const [showReply, setShowReply] = useState(false);

  const handleMessage = () => {
    setShowReply(prev => !prev);
  };

  const handleUpvote = () => {
    console.log('Upvote clicked for post', post.id);
  };

  const handleDownvote = () => {
    console.log('Downvote clicked for post', post.id);
  };

  return (
    <div>
      <Card className='rounded-lg bg-white shadow-md'>
        <CardHeader className='flex items-center justify-between gap-4 pb-4'>
          <div className='flex gap-4'>
            <Avatar>
              <AvatarImage src='https://tribuna.md/wp-content/uploads/2021/01/utm.jpg' />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            {post.title && (
              <CardTitle className='text-xl font-bold'>{post.title}</CardTitle>
            )}
          </div>

          {post.authorName && (
            <span className='text-sm text-gray-500'>by {post.authorName}</span>
          )}
        </CardHeader>

        <CardDescription className='px-4 py-2'>{post.content}</CardDescription>

        <CardFooter className='flex items-center justify-between px-4 py-2 text-sm text-gray-500'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            {post.createdAt && new Date(post.createdAt).toLocaleDateString()}
          </div>

          <div className='flex items-center gap-1'>
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
        </CardFooter>
      </Card>

      {showReply && <ReplyForm postId={post.id} />}
    </div>
  );
}
