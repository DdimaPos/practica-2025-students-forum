'use client';

import {Post_type} from '@/features/Post/types/Post_type';
import {Calendar, ArrowUp, ArrowDown} from 'lucide-react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

export default function Post({...post}: Post_type) {
  const handleUpvote = () => {
    console.log('Upvote clicked for post', post.id);
  };

  const handleDownvote = () => {
    console.log('Downvote clicked for post', post.id);
  };

  return (
    <Card className='rounded-lg bg-white shadow-md'>
      <CardHeader className='flex items-center gap-4 pb-4'>
        <Avatar>
          <AvatarImage src='https://tribuna.md/wp-content/uploads/2021/01/utm.jpg' />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        {post.title && (
          <CardTitle className='text-xl font-bold'>{post.title}</CardTitle>
        )}
      </CardHeader>

      <CardDescription className='px-4 py-2'>{post.content}</CardDescription>

      <CardFooter className='flex items-center justify-between px-4 py-2 text-sm text-gray-500'>
        <div className='flex items-center gap-2'>
          <Calendar className='h-4 w-4' />
          {post.createdAt && new Date(post.createdAt).toLocaleDateString()}
        </div>

        <div className='flex items-center gap-1'>
          <button onClick={handleUpvote} className='hover:text-green-500'>
            <ArrowUp className='h-4 w-4' />
          </button>
          <span>{post.rating ?? 0}</span>
          <button onClick={handleDownvote} className='hover:text-red-500'>
            <ArrowDown className='h-4 w-4' />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
