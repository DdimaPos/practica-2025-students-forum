import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CreatePostForm from './components/CreatePostForm';
import CreatePollForm from './components/CreatePollForm';

export default function PostPollHandler() {
  return (
    <Tabs defaultValue='post' className='w-full gap-4 p-4'>
      <TabsList className='grid w-full grid-cols-2 gap-2'>
        <TabsTrigger
          value='post'
          className='border-gray-200 bg-gray-50 p-2 ring-gray-200 focus:ring-2'
        >
          Create Post
        </TabsTrigger>
        <TabsTrigger
          value='poll'
          className='border-gray-200 bg-gray-50 p-2 ring-gray-200 focus:ring-2'
        >
          Create Poll
        </TabsTrigger>
      </TabsList>

      <TabsContent value='post'>
        <CreatePostForm />
      </TabsContent>
      <TabsContent value='poll'>
        <CreatePollForm />
      </TabsContent>
    </Tabs>
  );
}
