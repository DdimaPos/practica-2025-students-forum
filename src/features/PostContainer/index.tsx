'use client';

import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Post_type } from './types/Post_type';
import { UserAvatar, UserName } from '@/components/generic/user';
import ReplyContainer from './components/ReplyContainer';
import PollDisplay from './components/PollDisplay';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ArrowUp, ArrowDown, MessageCircle, Calendar } from 'lucide-react';
import { handleVote } from '../postList/actions/handleVote';
import { VoteType } from '../postList/types/VoteType';
import { getInitialVoteType } from '../postList/helperFunctions/getInitialVote';
import { VoteResult } from '../postList/types/VoteResult';

interface PostProps extends Post_type {
  userId?: string | null;
}

export default function Post({ userId, ...post }: PostProps) {
  const [voteType, setVoteType] = useState<VoteType>(
    getInitialVoteType(post.userReaction)
  );
  const [showReply, setShowReply] = useState(false);
  const router = useRouter();

  const handleReplyClick = () => {
    if (!userId) {
      router.push('/login');

      return;
    }

    setShowReply(prev => !prev);
  };

  const showVotedType = (result: VoteResult) => {
    if (result.success === true) {
      switch (result.reactionType) {
        case VoteType.upvote:
          if (result.action === 'updated') {
            setVoteType(VoteType.upvote);
          } else if (result.action === 'created') {
            setVoteType(VoteType.upvote);
          } else if (result.action === 'removed') {
            setVoteType(VoteType.none);
          }
          break;
        case VoteType.downvote:
          if (result.action === 'updated') {
            setVoteType(VoteType.downvote);
          } else if (result.action === 'created') {
            setVoteType(VoteType.downvote);
          } else if (result.action === 'removed') {
            setVoteType(VoteType.none);
          }
          break;
        default:
          Sentry.captureMessage('Unexpected reaction type in vote result', {
            level: 'warning',
            tags: { component: 'PostContainer', operation: 'showVotedType' },
            extra: { reaction_type: result.reactionType },
          });
      }
    }
  };

  const handleUpvote = async () => {
    const result = await handleVote(post.id, 'upvote');

    showVotedType(result);
  };

  const handleDownvote = async () => {
    const result = await handleVote(post.id, 'downvote');
    showVotedType(result);
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
          <div className='flex items-end justify-between'>
            <div className='flex items-start gap-3'>
              <UserAvatar
                profilePictureUrl={post.authorProfilePictureUrl}
                firstName={post.authorFirstName}
                lastName={post.authorLastName}
                fallback={post.isAnonymous ? 'A' : undefined}
              />
              <div className='flex h-10 flex-col justify-between'>
                {post.title && (
                  <CardTitle className='text-xl leading-none font-bold'>
                    {post.title}
                  </CardTitle>
                )}
                {post.authorName && (
                  <UserName
                    firstName={post.authorFirstName}
                    lastName={post.authorLastName}
                    userType={post.authorUserType}
                    isAnonymous={post.isAnonymous}
                    userId={post.authorId}
                    showLink={true}
                    prefix='by'
                    className='text-sm text-gray-500'
                    linkClassName='hover:text-blue-600 hover:underline'
                  />
                )}
              </div>
            </div>
            {post.channelName && post.channelId && (
              <Link
                href={`/channels/${post.channelId}`}
                className='text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline'
              >
                #{post.channelName}
              </Link>
            )}
          </div>
        </CardHeader>

        <CardDescription className='px-4 py-1'>{post.content}</CardDescription>

        {post.postType === 'poll' && (
          <PollDisplay postId={post.id} userId={userId} />
        )}

        <div className='flex justify-between px-4 py-2 text-xs text-gray-500'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            {post.createdAt &&
              new Date(post.createdAt).toLocaleDateString('en-GB')}
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
              className={`cursor-pointer hover:text-green-500 ${
                voteType === VoteType.upvote ? 'text-green-600' : ''
              }`}
            >
              <ArrowUp className='h-4 w-4' />
            </button>
            <span>{post.rating ?? 0}</span>
            <button
              onClick={handleDownvote}
              className={`cursor-pointer hover:text-red-500 ${
                voteType === VoteType.downvote ? 'text-red-600' : ''
              }`}
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
