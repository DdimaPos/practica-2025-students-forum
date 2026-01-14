import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { searchPosts } from '@/lib/search/queries';
import { rateLimits } from '@/lib/ratelimits';
import { getFirstIP } from '@/utils/getFirstIp';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const ip = getFirstIP(request.headers.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.search.limit(ip);

  if (!success) {
    Sentry.logger.warn('Rate limit exceeded', {
      endpoint: '/api/search/posts',
      ip_address: ip,
      rate_limit_type: 'search',
    });

    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || '';
    const limit = Math.min(
      Math.max(0, parseInt(searchParams.get('limit') || '0')),
      100
    );

    if (query.length > 100) {
      return NextResponse.json(
        { error: 'Search query too long' },
        { status: 400 }
      );
    }

    const result = await searchPosts(query, limit);

    Sentry.logger.info('Search completed', {
      endpoint: '/api/search/posts',
      query_length: query.length,
      result_count: result.total,
      limit,
    });

    Sentry.metrics.distribution('search.posts', Date.now() - startTime, {
      unit: 'milliseconds',
    });

    return NextResponse.json(result);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    Sentry.logger.error('Search failed', {
      endpoint: '/api/search/posts',
      error_message: error.message,
    });

    Sentry.captureException(error, {
      tags: { endpoint: '/api/search/posts' },
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
