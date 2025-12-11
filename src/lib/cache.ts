'use server';

import { revalidateTag, revalidatePath } from 'next/cache';

export async function revalidateCommentsCache(postId: string) {
  console.log(`🔄 Revalidating comments cache for post ${postId}`);
  try {
    revalidateTag(`comments-${postId}`);
    revalidatePath(`/posts/${postId}`);
    console.log(
      `✅ Successfully revalidated comments-${postId} cache and path`
    );
  } catch (error) {
    console.error('❌ Failed to revalidate comments-%s cache:', postId, error);
  }
}
