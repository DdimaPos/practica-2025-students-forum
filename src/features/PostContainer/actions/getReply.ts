'use server';

import db from '@/db';
import { comments } from '@/db/schema';
import { createClient } from '@/utils/supabase/server';
import { sanitize, isValidUuid } from '@/lib/security';

export async function addReply(
  postId: string,
  message: string,
  isAnonymous = false
) {
  if (!isValidUuid(postId)) {
    throw new Error('Invalid post ID format');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if(user){
    const sanitizedMessage = sanitize(message);

    if (!sanitizedMessage.trim()) {
      throw new Error('Reply message cannot be empty');
    }
    
    await db.insert(comments).values({
    authorId: user.id,
    parentCommentId: postId,
    content: sanitizedMessage,
    isAnonymous: isAnonymous,
    createdAt: new Date(),
    updatedAt: null,
  });
  }
}
