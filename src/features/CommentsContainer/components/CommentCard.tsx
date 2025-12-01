'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CommentType } from '../types/Comment_type';
import { Calendar, MessageCircle, ArrowUp, ArrowDown } from 'lucide-react';

interface CommentCardProps {
  comment: CommentType & { repliesCount?: number; rating?: number };
  onReplyClick?: () => void;
  hasReplyAttached?: boolean;
}

export default function CommentCard({
  comment,
  onReplyClick,
  hasReplyAttached = false,
}: CommentCardProps) {
  return (
    <Card
      className={`gap-0 py-4 shadow-sm ${hasReplyAttached ? 'mb-0 rounded-b-none' : 'mb-3'}`}
    >
      <CardHeader className='px-4 py-0'>
        <CardTitle className='text-sm font-semibold text-gray-800'>
          {comment.authorName}
        </CardTitle>
      </CardHeader>

      <CardContent className='px-4 py-0'>
        <p className='text-gray-700 text-wrap overflow-hidden'>
          {comment.content}
        </p>

        <div className='mt-2 flex justify-between text-xs text-gray-500'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            {comment.createdAt
              ? new Date(comment.createdAt).toLocaleDateString()
              : ''}
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={onReplyClick}
              className='flex items-center gap-1 hover:text-black'
            >
              <MessageCircle className='h-4 w-4' />
              <span>Reply</span>
            </button>

            <button className='hover:text-green-500'>
              <ArrowUp className='h-4 w-4' />
            </button>
            <span>{comment.rating ?? 0}</span>
            <button className='hover:text-red-500'>
              <ArrowDown className='h-4 w-4' />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
