'use client';

import Link from 'next/link';
import { Calendar, ArrowUp, ArrowDown, BarChart3 } from 'lucide-react';
import { UserAvatar, UserName } from '@/components/generic/user';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { PostProp } from '../types/post';
import { handleVote } from '../actions/handleVote';
import { useState } from 'react';
import { changeDynamicRating } from '../helperFunctions/changeRating';
import { VoteType } from '../types/VoteType';
import { getInitialVoteType } from '../helperFunctions/getInitialVote';

export default function PostCard({
  id,
  authorFirstName,
  authorLastName,
  authorUserType,
  authorProfilePictureUrl,
  authorId,
  isAnonymous,
  title,
  content,
  created_at,
  rating,
  postType,
  userReaction,
}: PostProp) {
  const [dynamicRating, setDynamicRating] = useState(rating);
  const [voteType, setVoteType] = useState<VoteType>(
    getInitialVoteType(userReaction)
  );

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await handleVote(id, 'upvote');
    //console.log(result);
    changeDynamicRating(result, setDynamicRating, setVoteType);
  };

  const handleDownvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await handleVote(id, 'downvote');
    //console.log(result);
    changeDynamicRating(result, setDynamicRating, setVoteType);
  };

  return (
    <Link href={`/posts/${id}`}>
      <Card className='mb-2 cursor-pointer shadow-sm transition hover:shadow-md'>
        <CardHeader className='flex flex-row items-start gap-3'>
          <UserAvatar
            profilePictureUrl={authorProfilePictureUrl}
            firstName={authorFirstName}
            lastName={authorLastName}
            fallback={isAnonymous ? 'A' : undefined}
            className='h-10 w-10'
          />

          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              <UserName
                firstName={authorFirstName}
                lastName={authorLastName}
                userType={authorUserType}
                isAnonymous={isAnonymous}
                userId={authorId}
                showLink={false}
                className='text-sm font-semibold'
              />
              {postType === 'poll' && (
                <span className='flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700'>
                  <BarChart3 className='h-3 w-3' />
                  Poll
                </span>
              )}
            </div>
            <CardTitle className='text-base'>{title}</CardTitle>
            <CardDescription className='text-sm text-gray-700'>
              {content}
            </CardDescription>
          </div>
        </CardHeader>

        <CardFooter className='flex items-center justify-between text-xs text-gray-500'>
          <div className='flex items-center gap-1'>
            <Calendar className='h-4 w-4' />
            {new Date(created_at).toLocaleString()}
          </div>
          <div className='flex items-center gap-2'>
            <ArrowUp
              className={`h-4 w-4 cursor-pointer hover:text-black ${
                voteType === VoteType.upvote ? 'text-green-600' : ''
              }`}
              onClick={handleUpvote}
            />
            <span>{dynamicRating}</span>
            <ArrowDown
              className={`h-4 w-4 cursor-pointer hover:text-black ${
                voteType === VoteType.downvote ? 'text-red-600' : ''
              }`}
              onClick={handleDownvote}
            />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
