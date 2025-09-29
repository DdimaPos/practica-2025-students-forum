// components/Leaderboard.tsx
import UsersLeaderboard from './UsersLeaderboard';
import ChannelsLeaderboard from './ChannelsLeaderboard';

export default function Leaderboard({ type }: { type: string }) {
  switch (type) {
    case 'users':
      return <UsersLeaderboard />;
    case 'channels':
      return <ChannelsLeaderboard />;
    default:
      return <div>No leaderboard available</div>;
  }
}
