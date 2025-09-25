import { NextRequest, NextResponse } from 'next/server';
import { getComments } from '@/features/CommentsContainer/actions/getComments';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const postId = Number(url.searchParams.get('postId'));
  const limit = Number(url.searchParams.get('limit') ?? 5);
  const offset = Number(url.searchParams.get('offset') ?? 0);

  if (!postId || Number.isNaN(postId)) {
    return NextResponse.json({ comments: [], total: 0 }, { status: 400 });
  }

  const data = await getComments(postId, limit, offset);
  return NextResponse.json(data);
}
