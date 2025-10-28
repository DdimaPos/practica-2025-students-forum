import { UserIdProp } from '../types/UserIdProp';

export default function CreatePollForm({ userId }: UserIdProp) {
  console.log('Creating post for user:', userId);

  return (
    <div className='rounded-xl border p-4 bg-background'>
      <h3 className='mb-2 font-medium'>Create a Poll</h3>
      <input
        type='text'
        placeholder='Poll question...'
        className='mb-3 w-full rounded-md border p-2'
      />
      <input
        type='text'
        placeholder='Option 1'
        className='mb-2 w-full rounded-md border p-2'
      />
      <input
        type='text'
        placeholder='Option 2'
        className='mb-2 w-full rounded-md border p-2'
      />
      <button className='bg-primary rounded-md px-4 py-2 text-white'>
        Publish Poll
      </button>
    </div>
  );
}
