'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import PostSortFilter from './components/PostSortFilter';
import PostCard from '@/features/postList/components/PostCard';
import type { ChannelDetail } from './actions/getChannelById';
import type { ChannelPost, SortOption } from './actions/getChannelPosts';
import { Hash, Users, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

type ChannelDetailContainerProps = {
  channel: ChannelDetail;
  initialPosts: ChannelPost[];
  initialSort: SortOption;
};

export default function ChannelDetailContainer({
  channel,
  initialPosts,
  initialSort,
}: ChannelDetailContainerProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [isPending, startTransition] = useTransition();

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    startTransition(() => {
      router.push(`/channels/${channel.id}?sort=${newSort}`, { scroll: false });
    });
  };

  const getChannelTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'academic':
        return 'bg-purple-100 text-purple-800';
      case 'social':
        return 'bg-pink-100 text-pink-800';
      case 'announcements':
        return 'bg-yellow-100 text-yellow-800';
      case 'local':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown';

    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className='container py-8'>
      {/* Channel Header */}
      <Card className='mb-8 p-6 shadow-sm'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex items-start gap-4'>
            <div className='bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full'>
              <Hash className='text-primary h-8 w-8' />
            </div>
            <div>
              <div className='flex items-center gap-3'>
                <h1 className='text-3xl font-bold'>{channel.name}</h1>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getChannelTypeColor(channel.channelType)}`}
                >
                  {channel.channelType}
                </span>
              </div>
              {channel.description && (
                <p className='text-muted-foreground mt-2 max-w-2xl'>
                  {channel.description}
                </p>
              )}
              <div className='text-muted-foreground mt-4 flex items-center gap-6 text-sm'>
                <div className='flex items-center gap-2'>
                  <Users className='h-4 w-4' />
                  <span>{channel.postCount} posts</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4' />
                  <span>Created {formatDate(channel.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Posts Section */}
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-2xl font-semibold'>Posts</h2>
        <PostSortFilter sortBy={sortBy} onSortChange={handleSortChange} />
      </div>

      {/* Posts List */}
      {isPending ? (
        <div className='flex h-64 items-center justify-center'>
          <p className='text-muted-foreground'>Loading posts...</p>
        </div>
      ) : initialPosts.length === 0 ? (
        <div className='text-muted-foreground flex h-64 items-center justify-center rounded-lg border border-dashed'>
          <div className='text-center'>
            <p className='text-lg font-medium'>No posts yet</p>
            <p className='text-sm'>Be the first to post in this channel!</p>
          </div>
        </div>
      ) : (
        <div className='space-y-4'>
          {initialPosts.map(post => (
            <PostCard
              key={post.id}
              id={post.id}
              author={post.authorName}
              authorFirstName={post.authorFirstName}
              authorLastName={post.authorLastName}
              authorUserType={post.authorUserType}
              authorProfilePictureUrl={post.authorProfilePictureUrl}
              authorId={post.authorId}
              isAnonymous={post.isAnonymous}
              title={post.title}
              content={post.content}
              created_at={post.createdAt?.toISOString() || ''}
              rating={post.rating}
              photo=''
            />
          ))}
        </div>
      )}
    </div>
  );
}
