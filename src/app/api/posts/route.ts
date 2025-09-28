import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import db from '@/db';
import { posts, users } from '@/db/schema';

const DEFAULT_LIMIT = 10;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    const results = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
      })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.authorId))
      .where(eq(posts.isActive, true))
      .orderBy(desc(posts.createdAt), desc(posts.id))
      .limit(limit)
      .offset(offset);

    const transformedResults = results.map(result => ({
      id: result.id,
      title: result.title,
      content: result.content,
      author: `${result.authorFirstName} ${result.authorLastName}`,
      created_at: result.createdAt!.toISOString(),
      rating: 0,
      photo: '',
    }));

    return NextResponse.json({
      posts: transformedResults,
      hasMore: results.length === limit,
    });
    
  } catch (error) {
    console.error('Posts fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
