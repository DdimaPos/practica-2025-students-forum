import { UserIdProp } from '../types/UserIdProp';

export default function CreatePostForm({ userId }: UserIdProp) {
  console.log('Creating post for user:', userId);

  return (
    <div className='rounded-xl border p-4'>
      <h3 className='mb-2 font-medium'>Create a Post</h3>
      <textarea
        placeholder='Write your post...'
        className='mb-3 w-full rounded-md border p-2'
      />
      <button className='bg-primary rounded-md px-4 py-2 text-white'>
        Publish Post
      </button>
    </div>
  );
}
