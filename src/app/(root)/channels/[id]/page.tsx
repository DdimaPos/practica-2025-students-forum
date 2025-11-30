import ChannelDetailContainer from '@/features/ChannelDetail';
import { getChannelById } from '@/features/ChannelDetail/actions/getChannelById';
import {
  getChannelPosts,
  SortOption,
} from '@/features/ChannelDetail/actions/getChannelPosts';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const channel = await getChannelById(id);

  if (!channel) {
    return {
      title: 'Channel Not Found',
    };
  }

  return {
    title: `#${channel.name}`,
    description:
      channel.description || `View posts in the ${channel.name} channel`,
  };
}

export default async function ChannelPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { sort = 'newest' } = await searchParams;

  const validSorts: SortOption[] = ['newest', 'oldest', 'popular'];
  const sortBy: SortOption = validSorts.includes(sort as SortOption)
    ? (sort as SortOption)
    : 'newest';

  const [channel, posts] = await Promise.all([
    getChannelById(id),
    getChannelPosts(id, sortBy),
  ]);

  if (!channel) {
    notFound();
  }

  return (
    <ChannelDetailContainer
      channel={channel}
      initialPosts={posts}
      initialSort={sortBy}
    />
  );
}
