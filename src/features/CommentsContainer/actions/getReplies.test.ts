import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getReplies } from './getReplies';
import db from '@/db';

vi.mock('@/db', () => ({
  default: {
    select: vi.fn(),
  },
}));

vi.mock('@/db/schema', () => ({
  comments: {
    id: 'id',
    postId: 'postId',
    authorId: 'authorId',
    parentCommentId: 'parentCommentId',
    content: 'content',
    isAnonymous: 'isAnonymous',
    createdAt: 'createdAt',
  },
  users: {
    id: 'id',
    firstName: 'firstName',
    lastName: 'lastName',
    userType: 'userType',
    profilePictureUrl: 'profilePictureUrl',
  },
  commentReactions: {
    commentId: 'commentId',
    userId: 'userId',
    reactionType: 'reactionType',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  sql: vi.fn(() => ({
    as: vi.fn((name: string) => name),
  })),
}));

vi.mock('drizzle-orm/pg-core', () => ({
  alias: vi.fn((table, name) => ({ ...table, _alias: name })),
}));

describe('getReplies', () => {
  const mockDb = vi.mocked(db);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return replies with default pagination', async () => {
    const mockReplies = [
      {
        id: 'reply-1',
        postId: 'post-1',
        authorId: 'user-1',
        parentComment: 'comment-1',
        content: 'This is a reply',
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        firstName: 'John',
        lastName: 'Doe',
        userType: 'student',
        profilePictureUrl: 'https://example.com/avatar.jpg',
        total: 1,
        repliesCount: 0,
        rating: 3,
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    offset: vi.fn().mockResolvedValue(mockReplies),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getReplies('comment-1');

    expect(result.comments).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.comments[0]).toEqual({
      id: 'reply-1',
      postId: 'post-1',
      authorId: 'user-1',
      parentComment: 'comment-1',
      content: 'This is a reply',
      isAnonymous: false,
      createdAt: new Date('2024-01-01'),
      authorName: 'John Doe',
      authorFirstName: 'John',
      authorLastName: 'Doe',
      authorUserType: 'student',
      authorProfilePictureUrl: 'https://example.com/avatar.jpg',
      repliesCount: 0,
      rating: 3,
    });
  });

  it('should return empty array when no replies exist', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    offset: vi.fn().mockResolvedValue([]),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getReplies('comment-1');

    expect(result.comments).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('should handle anonymous replies', async () => {
    const mockReplies = [
      {
        id: 'reply-1',
        postId: 'post-1',
        authorId: 'user-1',
        parentComment: 'comment-1',
        content: 'Anonymous reply',
        isAnonymous: true,
        createdAt: new Date('2024-01-01'),
        firstName: 'John',
        lastName: 'Doe',
        userType: 'student',
        profilePictureUrl: null,
        total: 1,
        repliesCount: 0,
        rating: 0,
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    offset: vi.fn().mockResolvedValue(mockReplies),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getReplies('comment-1');

    expect(result.comments[0].authorName).toBe('Anonymous');
    expect(result.comments[0].isAnonymous).toBe(true);
  });

  it('should handle replies without author (deleted user)', async () => {
    const mockReplies = [
      {
        id: 'reply-1',
        postId: 'post-1',
        authorId: null,
        parentComment: 'comment-1',
        content: 'Orphaned reply',
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        firstName: null,
        lastName: null,
        userType: null,
        profilePictureUrl: null,
        total: 1,
        repliesCount: 0,
        rating: 0,
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    offset: vi.fn().mockResolvedValue(mockReplies),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getReplies('comment-1');

    expect(result.comments[0].authorName).toBe('Anonymous');
  });

  it('should respect custom limit and offset', async () => {
    const mockReplies = [
      {
        id: 'reply-1',
        postId: 'post-1',
        authorId: 'user-1',
        parentComment: 'comment-1',
        content: 'Reply 1',
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        firstName: 'John',
        lastName: 'Doe',
        userType: 'student',
        profilePictureUrl: null,
        total: 20,
        repliesCount: 0,
        rating: 0,
      },
    ];

    const mockLimit = vi.fn().mockReturnValue({
      offset: vi.fn().mockResolvedValue(mockReplies),
    });

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockReturnValue({
                  limit: mockLimit,
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    await getReplies('comment-1', 10, 5);

    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(mockLimit().offset).toHaveBeenCalledWith(5);
  });

  it('should handle replies with null repliesCount and rating', async () => {
    const mockReplies = [
      {
        id: 'reply-1',
        postId: 'post-1',
        authorId: 'user-1',
        parentComment: 'comment-1',
        content: 'Test reply',
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        firstName: 'John',
        lastName: 'Doe',
        userType: 'student',
        profilePictureUrl: null,
        total: 1,
        repliesCount: null,
        rating: null,
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    offset: vi.fn().mockResolvedValue(mockReplies),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getReplies('comment-1');

    expect(result.comments[0].repliesCount).toBe(0);
    expect(result.comments[0].rating).toBe(0);
  });

  it('should handle multiple replies', async () => {
    const mockReplies = [
      {
        id: 'reply-1',
        postId: 'post-1',
        authorId: 'user-1',
        parentComment: 'comment-1',
        content: 'First reply',
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        firstName: 'John',
        lastName: 'Doe',
        userType: 'student',
        profilePictureUrl: null,
        total: 3,
        repliesCount: 2,
        rating: 5,
      },
      {
        id: 'reply-2',
        postId: 'post-1',
        authorId: 'user-2',
        parentComment: 'comment-1',
        content: 'Second reply',
        isAnonymous: false,
        createdAt: new Date('2024-01-02'),
        firstName: 'Jane',
        lastName: 'Smith',
        userType: 'teacher',
        profilePictureUrl: 'https://example.com/jane.jpg',
        total: 3,
        repliesCount: 0,
        rating: -1,
      },
      {
        id: 'reply-3',
        postId: 'post-1',
        authorId: 'user-3',
        parentComment: 'comment-1',
        content: 'Third reply',
        isAnonymous: true,
        createdAt: new Date('2024-01-03'),
        firstName: 'Bob',
        lastName: 'Johnson',
        userType: 'student',
        profilePictureUrl: null,
        total: 3,
        repliesCount: 1,
        rating: 0,
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    offset: vi.fn().mockResolvedValue(mockReplies),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getReplies('comment-1');

    expect(result.comments).toHaveLength(3);
    expect(result.total).toBe(3);
    expect(result.comments[0].authorName).toBe('John Doe');
    expect(result.comments[1].authorName).toBe('Jane Smith');
    expect(result.comments[2].authorName).toBe('Anonymous');
  });

  it('should handle nested replies (replies to replies)', async () => {
    const mockReplies = [
      {
        id: 'reply-1',
        postId: 'post-1',
        authorId: 'user-1',
        parentComment: 'comment-1',
        content: 'Reply with nested replies',
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        firstName: 'John',
        lastName: 'Doe',
        userType: 'student',
        profilePictureUrl: null,
        total: 1,
        repliesCount: 5,
        rating: 10,
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    offset: vi.fn().mockResolvedValue(mockReplies),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getReplies('comment-1');

    expect(result.comments[0].repliesCount).toBe(5);
  });

  it('should handle replies with positive and negative ratings', async () => {
    const mockReplies = [
      {
        id: 'reply-1',
        postId: 'post-1',
        authorId: 'user-1',
        parentComment: 'comment-1',
        content: 'Popular reply',
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        firstName: 'John',
        lastName: 'Doe',
        userType: 'student',
        profilePictureUrl: null,
        total: 2,
        repliesCount: 0,
        rating: 15,
      },
      {
        id: 'reply-2',
        postId: 'post-1',
        authorId: 'user-2',
        parentComment: 'comment-1',
        content: 'Unpopular reply',
        isAnonymous: false,
        createdAt: new Date('2024-01-02'),
        firstName: 'Jane',
        lastName: 'Smith',
        userType: 'student',
        profilePictureUrl: null,
        total: 2,
        repliesCount: 0,
        rating: -8,
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    offset: vi.fn().mockResolvedValue(mockReplies),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getReplies('comment-1');

    expect(result.comments[0].rating).toBe(15);
    expect(result.comments[1].rating).toBe(-8);
  });
});
