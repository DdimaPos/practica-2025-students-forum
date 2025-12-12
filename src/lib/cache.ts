'use server';

import { revalidateTag, revalidatePath } from 'next/cache';

export async function revalidateCommentsCache(postId: string) {
  const newPostId = postId.replace(/\n|\r/g, '');

  console.log('🔄 Revalidating comments cache for post %s', postId);
  try {
    revalidateTag(`comments-${newPostId}`, 'default');
    revalidatePath(`/posts/${newPostId}`);
    console.log(
      '✅ Successfully revalidated comments-%s cache and path',
      newPostId
    );
  } catch (error) {
    console.error(
      '❌ Failed to revalidate comments-%s cache:',
      newPostId,
      error
    );
  }
}
