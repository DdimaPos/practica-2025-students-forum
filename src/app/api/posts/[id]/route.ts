import {NextResponse} from 'next/server';
import db from '@/db';
import {posts} from '@/db/schema';
import {eq} from 'drizzle-orm';
import calculateRating from './functions/calculateRating';

export async function GET(
  req: Request,
  props: {params: Promise<{id: string}>}
) {
  try {
    const {id} = await props.params;

    const result = await db
      .select()
      .from(posts)
      .where(eq(posts.id, Number(id)));

    if (result.length === 0) {
      return NextResponse.json({error: 'Post not found'}, {status: 404});
    }

    const post = result[0];

    const rating = await calculateRating(Number(id));

    return NextResponse.json({...post, rating});
  } catch (err) {
    console.error(err);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}
