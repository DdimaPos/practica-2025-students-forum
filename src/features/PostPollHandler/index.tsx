'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CreatePostForm from './components/CreatePostForm';
import CreatePollForm from './components/CreatePollForm';
import { UserIdProp } from './types/UserIdProp';

export default function PostPollHandler({ userId }: UserIdProp) {
  return (
    <div className='w-full max-h-[91vh] overflow-y-auto hide-scrollbar'>
      <Tabs defaultValue='post' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='post'>Create Post</TabsTrigger>
          <TabsTrigger value='poll'>Create Poll</TabsTrigger>
        </TabsList>

        <TabsContent value='post'>
          <CreatePostForm userId={userId} />
        </TabsContent>

        <TabsContent value='poll'>
          <CreatePollForm userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}