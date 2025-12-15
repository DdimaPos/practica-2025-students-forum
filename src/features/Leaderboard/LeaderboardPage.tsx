import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Leaderboard from './components/Leaderboard';

export default function LeaderboardPage() {
  return (
    <div className='hide-scrollbar pt-5'>
      <Tabs defaultValue='users'>
        <TabsList>
          <TabsTrigger value='users'>Users</TabsTrigger>
          <TabsTrigger value='channels'>Channels</TabsTrigger>
        </TabsList>

        <TabsContent value='users'>
          <Leaderboard type='users' />
        </TabsContent>
        <TabsContent value='students'>
          <Leaderboard type='students' />
        </TabsContent>
        <TabsContent value='channels'>
          <Leaderboard type='channels' />
        </TabsContent>
      </Tabs>
    </div>
  );
}
