import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProfileStats } from './getProfileStats';

// Mock the database
const mockWhere = vi.fn();

vi.mock('@/db', () => ({
  default: {
    select: () => ({
      from: () => ({
        where: mockWhere,
      }),
    }),
  },
}));

vi.mock('@/db/schema', () => ({
  posts: {},
  comments: {},
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  count: vi.fn(),
}));

describe('getProfileStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct stats for user with posts and comments', async () => {
    mockWhere.mockResolvedValueOnce([{ count: 5 }]);
    mockWhere.mockResolvedValueOnce([{ count: 3 }]);

    const result = await getProfileStats('user-123');

    expect(result).toEqual({
      postsCount: 5,
      commentsCount: 3,
    });
  });

  it('should return zero stats when no posts or comments exist', async () => {
    mockWhere.mockResolvedValueOnce([{ count: 0 }]);
    mockWhere.mockResolvedValueOnce([{ count: 0 }]);

    const result = await getProfileStats('user-456');

    expect(result).toEqual({
      postsCount: 0,
      commentsCount: 0,
    });
  });

  it('should handle database errors gracefully', async () => {
    // Mock database error
    mockWhere.mockRejectedValueOnce(new Error('Database connection failed'));

    const result = await getProfileStats('user-789');

    expect(result).toEqual({
      postsCount: 0,
      commentsCount: 0,
    });
  });
});
