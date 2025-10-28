import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { posts } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      content,
      post_type,
      author_id,
      channel_id,
      is_anonymous,
      is_active,
    } = body;

    if (!title || !content || !author_id) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: title, content, and author_id are required',
        },
        { status: 400 }
      );
    }

    const [newPost] = await db
      .insert(posts)
      .values({
        title: title,
        content: content,
        postType: post_type || 'basic',
        authorId: author_id,
        channelId: channel_id || null,
        isAnonymous: is_anonymous || false,
        isActive: is_active !== undefined ? is_active : true,
      })
      .returning();

    return NextResponse.json(
      {
        message: 'Post created successfully',
        post: newPost,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
