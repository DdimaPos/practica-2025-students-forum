import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import type { rateLimits } from '@/lib/ratelimits';

type RateLimitResponse = Awaited<
  ReturnType<(typeof rateLimits)['postView']['limit']>
>;

vi.mock('@/lib/ratelimits', () => ({
  rateLimits: {
    postView: {
      limit: vi.fn(() =>
        Promise.resolve({
          success: true,
          limit: 10,
          remaining: 9,
          reset: Date.now() + 60000,
        })
      ),
    },
  },
}));

vi.mock('@/utils/getUser', () => ({
  getUser: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('@/db', () => ({
  default: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        innerJoin: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            where: vi.fn(() => ({
              groupBy: vi.fn(() => ({
                orderBy: vi.fn(() => ({
                  limit: vi.fn(() => ({
                    offset: vi.fn(() => Promise.resolve([])),
                  })),
                })),
              })),
            })),
          })),
        })),
      })),
    })),
  },
}));

vi.mock('@/db/schema', () => ({
  posts: {
    id: 'id',
    authorId: 'authorId',
    title: 'title',
    content: 'content',
    createdAt: 'createdAt',
    isActive: 'isActive',
    isAnonymous: 'isAnonymous',
    postType: 'postType',
  },
  users: {
    id: 'id',
    firstName: 'firstName',
    lastName: 'lastName',
    userType: 'userType',
    profilePictureUrl: 'profilePictureUrl',
  },
  postReactions: {
    postId: 'postId',
    userId: 'userId',
    reactionType: 'reactionType',
  },
}));

describe('GET /api/posts – negative tests & fuzzing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return posts with default parameters', async () => {
    const request = new NextRequest('http://localhost:3000/api/posts');
    const response = await GET(request);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data.posts)).toBe(true);
  });

  it('should handle non-numeric limit parameter', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/posts?limit=abc'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data.posts)).toBe(true);
  });

  it('should handle negative offset gracefully', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/posts?offset=-100'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data.posts)).toBe(true);
  });

  it('should not crash on extremely large limit value', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/posts?limit=999999'
    );
    const response = await GET(request);

    expect(response.status).not.toBe(500);
  });

  it('verifies that the endpoint does not crash when receiving malformed or malicious query parameters.', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/posts?limit=10;DROP TABLE posts;'
    );
    const response = await GET(request);

    expect(response.status).not.toBe(500);
  });

  it('should return 429 when rate limit exceeded', async () => {
    const { rateLimits } = await import('@/lib/ratelimits');

    vi.mocked(rateLimits.postView.limit).mockResolvedValueOnce(
      createRateLimitResponse(false)
    );

    const request = new NextRequest('http://localhost:3000/api/posts');
    const response = await GET(request);

    expect(response.status).toBe(429);
  });
});

function createRateLimitResponse(success: boolean): RateLimitResponse {
  const base = {
    success,
    limit: 10,
    remaining: success ? 9 : 0,
    reset: Date.now() + 60_000,
  };

  const response: RateLimitResponse = {
    ...base,
    pending: Promise.resolve(undefined as unknown as RateLimitResponse),
  };

  return response;
}
