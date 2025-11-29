import AllChannelsContainer from '@/features/AllChannels';
import { getChannels } from '@/utils/getChannels';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Channels',
  description: 'Browse all available channels',
};

export default async function ChannelsPage() {
  const channels = await getChannels();

  return <AllChannelsContainer channels={channels} />;
}
