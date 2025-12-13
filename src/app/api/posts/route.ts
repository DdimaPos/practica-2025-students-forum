import { NextResponse } from 'next/server';
import { desc, eq, sql } from 'drizzle-orm';
import db from '@/db';
import { posts, users, postReactions } from '@/db/schema';
import { getUser } from '@/utils/getUser';

const DEFAULT_LIMIT = 10;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT))
    );
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    const user = await getUser();

    const results = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        authorId: posts.authorId,
        isAnonymous: posts.isAnonymous,
        postType: posts.postType,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
        rating: sql<number>`COALESCE(SUM(
          CASE
            WHEN ${postReactions.reactionType} = 'upvote' THEN 1
            WHEN ${postReactions.reactionType} = 'downvote' THEN -1
            ELSE 0
          END
        ), 0)`.as('rating'),
        userReaction: user
          ? sql<string | null>`MAX(
              CASE
                WHEN ${postReactions.userId} = ${user.id} 
                THEN ${postReactions.reactionType}
                ELSE NULL
              END
            )`.as('user_reaction')
          : sql<string | null>`NULL`.as('user_reaction'),
        authorUserType: users.userType,
        authorProfilePictureUrl: users.profilePictureUrl,
      })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.authorId))
      .leftJoin(postReactions, eq(postReactions.postId, posts.id))
      .where(eq(posts.isActive, true))
      .groupBy(
        posts.id,
        users.firstName,
        users.lastName,
        users.userType,
        users.profilePictureUrl
      )
      .orderBy(desc(posts.createdAt), desc(posts.id))
      .limit(limit)
      .offset(offset);

    const transformedResults = results.map(result => ({
      id: result.id,
      title: result.title,
      content: result.content,
      author: `${result.authorFirstName} ${result.authorLastName}`,
      authorFirstName: result.authorFirstName,
      authorLastName: result.authorLastName,
      authorUserType: result.authorUserType,
      authorProfilePictureUrl: result.authorProfilePictureUrl,
      authorId: result.authorId,
      isAnonymous: result.isAnonymous,
      postType: result.postType,
      created_at: result.createdAt!.toISOString(),
      rating: result.rating,
      photo: '',
      userReaction: result.userReaction as 'upvote' | 'downvote' | null,
    }));

    return NextResponse.json({
      posts: transformedResults,
      hasMore: results.length === limit,
    });
  } catch (error) {
    console.error('Posts fetch error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
