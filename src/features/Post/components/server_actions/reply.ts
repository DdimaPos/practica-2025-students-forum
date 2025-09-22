'use server';

import db from '@/db';
import { comments } from '@/db/schema';
import { createClient } from '@/utils/supabase/server';

export async function addReply(
  postId: number,
  message: string,
  isAnonymous = false
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if(user){
    await db.insert(comments).values({
    authorId: Number(user.id),
    parentCommentId: postId,
    content: message,
    isAnonymous: isAnonymous,
    createdAt: new Date(),
    updatedAt: null,
  });
  }
}
