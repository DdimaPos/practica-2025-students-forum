import UsersLeaderboard from './components/UsersLeaderboard';
import ChannelsLeaderboard from './components/ChannelsLeaderboard';

export default function LeaderboardContainer() {
  return (
    <div className='space-y-4'>
      <UsersLeaderboard />
      <ChannelsLeaderboard />
    </div>
  );
}
