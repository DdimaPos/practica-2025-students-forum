import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Leaderboard from './components/Leaderboard';

export default function LeaderboardPage() {
  return (
    <div className='pt-5 hide-scrollbar'>
      <Tabs defaultValue='users'>
        <TabsList>
          <TabsTrigger value='users'>Users</TabsTrigger>
          <TabsTrigger value='channels'>Channels</TabsTrigger>
        </TabsList>

        <div className='bg-background h-1 rounded-md'></div>

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
