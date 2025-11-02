'use client';

import { Suspense } from 'react';
import ChannelSelectContent from './ChannelSelectContent';
import ChannelSelectLoading from './ChannelSelectLoading';

export default function ChannelSelectionDropdown({
  onSelectChannel,
  disabled,
}: {
  onSelectChannel: (channelId: string) => void;
  disabled?: boolean;
}) {
  return (
    <Suspense fallback={<ChannelSelectLoading />}>
      <ChannelSelectContent 
        onSelectChannel={onSelectChannel}
        disabled={disabled}
      />
    </Suspense>
  );
}