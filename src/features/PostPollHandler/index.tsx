import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CreatePostForm from './components/CreatePostForm';
import CreatePollForm from './components/CreatePollForm';
import { UserIdProp } from './types/UserIdProp';

export default function PostPollHandler({ userId }: UserIdProp) {
  return (
    <Tabs defaultValue='post' className='w-full p-4 gap-4'>
      <TabsList className='grid w-full grid-cols-2 gap-2'>
        <TabsTrigger value='post'
          className='p-2 border-gray-200 ring-gray-200 focus:ring-2 bg-gray-50'>
          Create Post
        </TabsTrigger>
        <TabsTrigger
          value='poll'
          className='p-2 border-gray-200 ring-gray-200 focus:ring-2 bg-gray-50'>
          Create Poll
        </TabsTrigger>
      </TabsList>

      <TabsContent value='post'>
        <CreatePostForm userId={userId} />
      </TabsContent>
      <TabsContent value='poll'>
        <CreatePollForm userId={userId} />
      </TabsContent>
    </Tabs>
  );
}
