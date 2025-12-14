import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserPosts } from './getUserPosts';

vi.mock('@/db', () => ({
  default: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(),
              })),
            })),
          })),
        })),
      })),
    })),
  },
}));

vi.mock('@/db/schema', () => ({
  posts: {},
  users: {},
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  desc: vi.fn(),
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
        authorFirstName: 'John',
        authorLastName: 'Doe',
      },
    ];

    // Mock the offset to return the posts
    const mockOffset = vi.fn().mockResolvedValue(mockPosts);
    const db = (await import('@/db')).default;
    db.select.mockReturnValue({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            orderBy: () => ({
              limit: () => ({
                offset: mockOffset,
              }),
            }),
          }),
        }),
      }),
    });

    const result = await getUserPosts('user-123');

    expect(result).toEqual({
      posts: [
        {
          id: 'post-1',
          title: 'Test Post',
          content: 'Content',
          author: 'John Doe',
          created_at: '2023-01-01T00:00:00.000Z',
          rating: 0,
          photo: '',
        },
      ],
      hasMore: false,
    });
  });

  it('should handle pagination correctly', async () => {
    const mockPosts = Array(10).fill({
      id: 'post-1',
      title: 'Test',
      content: 'Content',
      createdAt: new Date(),
      authorFirstName: 'John',
      authorLastName: 'Doe',
    });

    const mockOffset = vi.fn().mockResolvedValue(mockPosts);
    const db = (await import('@/db')).default;
    db.select.mockReturnValue({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            orderBy: () => ({
              limit: () => ({
                offset: mockOffset,
              }),
            }),
          }),
        }),
      }),
    });

    const result = await getUserPosts('user-123', 10, 0);

    expect(result.posts).toHaveLength(10);
    expect(result.hasMore).toBe(true);
  });

  it('should handle database errors gracefully', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const mockOffset = vi.fn().mockRejectedValue(new Error('DB error'));
    const db = (await import('@/db')).default;
    db.select.mockReturnValue({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            orderBy: () => ({
              limit: () => ({
                offset: mockOffset,
              }),
            }),
          }),
        }),
      }),
    });

    const result = await getUserPosts('user-123');

    expect(result).toEqual({
      posts: [],
      hasMore: false,
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching user posts:',
      'DB error'
    );

    consoleErrorSpy.mockRestore();
  });
});
