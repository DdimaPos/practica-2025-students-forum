import { getComments } from '../../db_api/getComments';
import CommentThread from './components/CommentThread/CommentThread';

export default async function CommentSection({ postId }: { postId: number }) {
  const { comments, total } = await getComments(postId);

  return (
    <div>
      {comments.length === 0 ? (
        <div className='flex h-24 items-center justify-center'>
          <p className='text-muted-foreground text-3xl'>
            Be the first to comment!
          </p>
        </div>
      ) : (
        <div>
          <div className='border-l-2 border-gray-200 pl-4'>
            {comments.map((c, index) => (
              <CommentThread key={index} comment={c} />
            ))}
          </div>

          {total > comments.length && (
            <p className='mt-4 text-center text-sm text-gray-500'>
              Showing {comments.length} of {total} comments.
              <button className='ml-2 text-blue-600 hover:underline'>
                Load more
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
