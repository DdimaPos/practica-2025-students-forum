import { NextRequest, NextResponse } from 'next/server';
import { searchPosts } from '@/lib/search/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || '';
    const limit = Math.min(Math.max(0, parseInt(searchParams.get('limit') || '0')), 100); // Cap limit

    if (query.length > 100) {
      return NextResponse.json(
        { error: 'Search query too long' },
        { status: 400 }
      );
    }

    const result = await searchPosts(query, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
