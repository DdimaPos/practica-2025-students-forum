import { useFetch } from '../hooks/useFetch';
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

interface ChannelsResponse {
  channels: Channel[];
}

export default function ChannelSelectContent({
  onSelectChannel,
  disabled,
}: {
  onSelectChannel: (channelId: string) => void;
  disabled?: boolean;
}) {
  const { data, error } = useFetch<ChannelsResponse>('/api/channels');

  const channels = data?.channels || [];

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
    <Select onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger className='w-full'>
        <SelectValue placeholder='Select a channel' />
      </SelectTrigger>
      <SelectContent>
        {channels.length === 0 ? (
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
