'use client';

import { useState, useMemo } from 'react';
import ChannelCard from './components/ChannelCard';
import ChannelFilters from './components/ChannelFilters';
import type { ChannelType } from '@/utils/getChannels';

type AllChannelsContainerProps = {
  channels: ChannelType[];
};

export default function AllChannelsContainer({
  channels,
}: AllChannelsContainerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      const matchesSearch = channel.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        selectedType === 'all' || channel.channelType === selectedType;

      return matchesSearch && matchesType;
    });
  }, [channels, searchQuery, selectedType]);

  return (
    <>
      <style jsx global>{`
        main > div:first-of-type {
          display: none !important;
        }
      `}</style>
      <div className='container py-8'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold'>All Channels</h1>
          <p className='text-muted-foreground mt-2'>
            Browse and join channels that interest you
          </p>
        </div>

      <ChannelFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      {filteredChannels.length === 0 ? (
        <div className='text-muted-foreground flex h-64 items-center justify-center rounded-lg border border-dashed'>
          <div className='text-center'>
            <p className='text-lg font-medium'>No channels found</p>
            <p className='text-sm'>Try adjusting your filters</p>
          </div>
        </div>
      ) : (
        <>
          <p className='text-muted-foreground mb-4 text-sm'>
            Showing {filteredChannels.length} of {channels.length} channels
          </p>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {filteredChannels.map(channel => (
              <ChannelCard
                key={channel.id}
                id={channel.id}
                name={channel.name}
                description={channel.description}
                channelType={channel.channelType}
              />
            ))}
          </div>
        </>
      )}
      </div>
    </>
  );
}
