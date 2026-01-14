import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserPosts } from './getUserPosts';

// Mock the final method in the chain
const mockOffset = vi.fn();

vi.mock('@/db', () => ({
  default: {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          leftJoin: () => ({
            where: () => ({
              groupBy: () => ({
                orderBy: () => ({
                  limit: () => ({
                    offset: mockOffset,
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    }),
  },
}));

vi.mock('@/db/schema', () => ({
  posts: {},
  users: {},
  postReactions: {},
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  desc: vi.fn(),
  // sql is a tagged template literal that returns an object with .as() method
  sql: new Proxy(() => ({ as: () => 'mocked_sql_column' }), {
    get: () => () => ({ as: () => 'mocked_sql_column' }),
  }),
}));

vi.mock('@/utils/getUser', () => ({
  getUser: vi.fn().mockResolvedValue({ id: 'current-user-123' }),
}));

describe('getUserPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user posts with correct transformation', async () => {
    const mockPosts = [
      {
        id: 'post-1',
        title: 'Test Post',
        content: 'Content',
        createdAt: new Date('2023-01-01'),
        postType: 'basic',
        isAnonymous: false,
        authorId: 'user-123',
        authorFirstName: 'John',
        authorLastName: 'Doe',
        authorUserType: 'student',
        authorProfilePictureUrl: null,
        rating: 5,
        userReaction: null,
      },
    ];

    mockOffset.mockResolvedValueOnce(mockPosts);

    const result = await getUserPosts('user-123');

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0]).toMatchObject({
      id: 'post-1',
      title: 'Test Post',
      content: 'Content',
      created_at: '2023-01-01T00:00:00.000Z',
      rating: 5,
      postType: 'basic',
      isAnonymous: false,
      authorId: 'user-123',
      authorFirstName: 'John',
      authorLastName: 'Doe',
      authorUserType: 'student',
      authorProfilePictureUrl: null,
      userReaction: null,
    });
    expect(result.hasMore).toBe(false);
  });

  it('should handle pagination correctly', async () => {
    const mockPosts = Array(10).fill({
      id: 'post-1',
      title: 'Test',
      content: 'Content',
      createdAt: new Date(),
      postType: 'basic',
      isAnonymous: false,
      authorId: 'user-123',
      authorFirstName: 'John',
      authorLastName: 'Doe',
      authorUserType: 'student',
      authorProfilePictureUrl: null,
      rating: 0,
      userReaction: null,
    });

    mockOffset.mockResolvedValueOnce(mockPosts);

    const result = await getUserPosts('user-123', 10, 0);

    expect(result.posts).toHaveLength(10);
    expect(result.hasMore).toBe(true);
  });

  it('should handle database errors gracefully', async () => {
    mockOffset.mockRejectedValueOnce(new Error('DB error'));

    const result = await getUserPosts('user-123');

    expect(result).toEqual({
      posts: [],
      hasMore: false,
    });
  });
});
