'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Channel {
  id: string;
  name: string;
  description: string | null;
  channelType: string;
}

export default function ChannelSelectionDropdown({
  onSelectChannel,
  disabled,
}: {
  onSelectChannel: (channelId: string) => void;
  disabled?: boolean;
}) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChannels() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/channels');

        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }

        const data = await response.json();
        setChannels(data.channels || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching channels:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchChannels();
  }, []);

  const handleValueChange = (value: string) => {
    onSelectChannel(value);
  };

  if (error) {
    return (
      <div className='text-sm text-red-500'>
        Error loading channels: {error}
      </div>
    );
  }

  return (
    <Select onValueChange={handleValueChange} disabled={disabled || loading}>
      <SelectTrigger className='w-full'>
        <SelectValue
          placeholder={loading ? 'Loading channels...' : 'Select a channel'}
        />
      </SelectTrigger>
      <SelectContent>
        {channels.length === 0 && !loading ? (
          <div className='text-muted-foreground px-2 py-1.5 text-sm'>
            No channels available
          </div>
        ) : (
          channels.map(channel => (
            <SelectItem key={channel.id} value={channel.id}>
              <div className='flex flex-col'>
                <span className='font-medium'>{channel.name}</span>
                {channel.description && (
                  <span className='text-muted-foreground text-xs'>
                    {channel.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
