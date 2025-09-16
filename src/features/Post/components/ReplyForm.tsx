'use client';

import {useState} from 'react';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Send} from 'lucide-react';

interface ReplyFormProps {
  postId: string;
}

export default function ReplyForm({postId}: ReplyFormProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    console.log('Reply for post', postId, ':', message);
    setMessage('');
  };

  return (
    <div className='mt-4 flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2'>
      <Textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder='Write reply...'
        className='flex-1 resize-none'
        rows={1}
      />

      <Button onClick={handleSubmit} className='ml-auto cursor-pointer p-2'>
        <Send className='h-5 w-5' />
      </Button>
    </div>
  );
}
