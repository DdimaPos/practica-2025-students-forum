import { NextRequest, NextResponse } from 'next/server';
import { getReplies } from '@/features/CommentsContainer/actions/getReplies';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const parentId = parseInt(id, 10);
  const { searchParams } = new URL(req.url);

  const limit = parseInt(searchParams.get('limit') ?? '5', 10);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  if (isNaN(parentId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const result = await getReplies(parentId, limit, offset);

  return NextResponse.json(result);
}
