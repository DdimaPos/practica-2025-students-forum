import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import db from '@/db';
import { posts, users } from '@/db/schema';

export async function GET() {
  try {
    const results = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        authorId: posts.authorId,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
      })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.authorId))
      .where(eq(posts.isActive, true))
      .orderBy(desc(posts.createdAt), desc(posts.id));

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
      count: results.length,
    });
  } catch (error) {
    console.error('Posts fetch error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
