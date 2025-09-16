import {NextResponse} from 'next/server';
import db from '@/db';
import {posts} from '@/db/schema';
import {eq} from 'drizzle-orm';

export async function GET(
  req: Request,
  props: {params: Promise<{id: string}>}
) {
  const {id} = await props.params;

  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.id, Number(id)));

  const post = result[0];

  if (!post) {
    return NextResponse.json({error: 'Post not found'}, {status: 404});
  }

  return NextResponse.json(post);
}
