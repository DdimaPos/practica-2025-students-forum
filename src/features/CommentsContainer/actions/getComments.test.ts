import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getComments } from './getComments';
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
  isNull: vi.fn(),
  and: vi.fn(),
  sql: vi.fn(() => ({
    as: vi.fn((name: string) => name),
  })),
  desc: vi.fn(),
}));

vi.mock('drizzle-orm/pg-core', () => ({
  alias: vi.fn((table, name) => ({ ...table, _alias: name })),
}));

describe('getComments', () => {
  const mockDb = vi.mocked(db);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return comments with default pagination', async () => {
    const mockComments = [
      {
        id: 'comment-1',
        postId: 'post-1',
        authorId: 'user-1',
        parentComment: null,
        content: 'Test comment',
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        firstName: 'John',
        lastName: 'Doe',
        userType: 'student',
        profilePictureUrl: 'https://example.com/avatar.jpg',
        total: 1,
        repliesCount: 2,
        rating: 5,
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockReturnValue({
                  orderBy: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                      offset: vi.fn().mockResolvedValue(mockComments),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getComments('post-1');

    expect(result.comments).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.comments[0]).toEqual({
      id: 'comment-1',
      postId: 'post-1',
      authorId: 'user-1',
      parentComment: null,
      content: 'Test comment',
      isAnonymous: false,
      createdAt: new Date('2024-01-01'),
      authorName: 'John Doe',
      authorFirstName: 'John',
      authorLastName: 'Doe',
      authorUserType: 'student',
      authorProfilePictureUrl: 'https://example.com/avatar.jpg',
      repliesCount: 2,
      rating: 5,
    });
  });

  it('should return empty array when no comments exist', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockReturnValue({
                  orderBy: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                      offset: vi.fn().mockResolvedValue([]),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getComments('post-1');

    expect(result.comments).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('should handle anonymous comments', async () => {
    const mockComments = [
      {
        id: 'comment-1',
        postId: 'post-1',
        authorId: 'user-1',
        parentComment: null,
        content: 'Anonymous comment',
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
                  orderBy: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                      offset: vi.fn().mockResolvedValue(mockComments),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getComments('post-1');

    expect(result.comments[0].authorName).toBe('Anonymous');
    expect(result.comments[0].isAnonymous).toBe(true);
  });

  it('should handle comments without author (deleted user)', async () => {
    const mockComments = [
      {
        id: 'comment-1',
        postId: 'post-1',
        authorId: null,
        parentComment: null,
        content: 'Orphaned comment',
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
                  orderBy: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                      offset: vi.fn().mockResolvedValue(mockComments),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getComments('post-1');

    expect(result.comments[0].authorName).toBe('Anonymous');
  });

  it('should respect custom limit and offset', async () => {
    const mockComments = [
      {
        id: 'comment-1',
        postId: 'post-1',
        authorId: 'user-1',
        parentComment: null,
        content: 'Comment 1',
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
      offset: vi.fn().mockResolvedValue(mockComments),
    });

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockReturnValue({
                  orderBy: vi.fn().mockReturnValue({
                    limit: mockLimit,
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    await getComments('post-1', 10, 5);

    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(mockLimit().offset).toHaveBeenCalledWith(5);
  });

  it('should handle comments with null repliesCount and rating', async () => {
    const mockComments = [
      {
        id: 'comment-1',
        postId: 'post-1',
        authorId: 'user-1',
        parentComment: null,
        content: 'Test comment',
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
                  orderBy: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                      offset: vi.fn().mockResolvedValue(mockComments),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getComments('post-1');

    expect(result.comments[0].repliesCount).toBe(0);
    expect(result.comments[0].rating).toBe(0);
  });

  it('should handle multiple comments', async () => {
    const mockComments = [
      {
        id: 'comment-1',
        postId: 'post-1',
        authorId: 'user-1',
        parentComment: null,
        content: 'First comment',
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        firstName: 'John',
        lastName: 'Doe',
        userType: 'student',
        profilePictureUrl: null,
        total: 3,
        repliesCount: 1,
        rating: 5,
      },
      {
        id: 'comment-2',
        postId: 'post-1',
        authorId: 'user-2',
        parentComment: null,
        content: 'Second comment',
        isAnonymous: false,
        createdAt: new Date('2024-01-02'),
        firstName: 'Jane',
        lastName: 'Smith',
        userType: 'teacher',
        profilePictureUrl: 'https://example.com/jane.jpg',
        total: 3,
        repliesCount: 0,
        rating: -2,
      },
      {
        id: 'comment-3',
        postId: 'post-1',
        authorId: 'user-3',
        parentComment: null,
        content: 'Third comment',
        isAnonymous: true,
        createdAt: new Date('2024-01-03'),
        firstName: 'Bob',
        lastName: 'Johnson',
        userType: 'student',
        profilePictureUrl: null,
        total: 3,
        repliesCount: 5,
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
                  orderBy: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                      offset: vi.fn().mockResolvedValue(mockComments),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getComments('post-1');

    expect(result.comments).toHaveLength(3);
    expect(result.total).toBe(3);
    expect(result.comments[0].authorName).toBe('John Doe');
    expect(result.comments[1].authorName).toBe('Jane Smith');
    expect(result.comments[2].authorName).toBe('Anonymous');
  });

  it('should trim author name when firstName or lastName have spaces', async () => {
    const mockComments = [
      {
        id: 'comment-1',
        postId: 'post-1',
        authorId: 'user-1',
        parentComment: null,
        content: 'Test',
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        firstName: 'John    ',
        lastName: '    Doe',
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
                  orderBy: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                      offset: vi.fn().mockResolvedValue(mockComments),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getComments('post-1');

    expect(result.comments[0].authorName).toBe('John Doe');
  });
});
