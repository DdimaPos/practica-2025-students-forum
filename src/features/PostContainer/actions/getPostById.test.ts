import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPostById } from './getPostById';
import db from '@/db';
import { getUser } from '@/utils/getUser';

vi.mock('@/db', () => ({
  default: {
    select: vi.fn(),
  },
}));

vi.mock('@/db/schema', () => ({
  posts: {
    id: 'id',
    title: 'title',
    content: 'content',
    postType: 'postType',
    authorId: 'authorId',
    channelId: 'channelId',
    isAnonymous: 'isAnonymous',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
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
  channels: {
    id: 'id',
    name: 'name',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  sql: vi.fn(() => ({
    as: vi.fn((name: string) => name),
  })),
}));

vi.mock('@/utils/getUser', () => ({
  getUser: vi.fn(),
}));

describe('getPostById', () => {
  const mockDb = vi.mocked(db);
  const mockGetUser = vi.mocked(getUser);

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue(undefined);
  });

  it('should return post by id for authenticated user', async () => {
    mockGetUser.mockResolvedValue({
      id: 'user-123',
      email: 'test@test.com',
    } as never);

    const mockPost = [
      {
        id: 'post-1',
        title: 'Test Post',
        content: 'Test Content',
        postType: 'basic',
        authorId: 'author-1',
        channelId: 'channel-1',
        channelName: 'General',
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        rating: 10,
        firstName: 'John',
        lastName: 'Doe',
        userReaction: 'upvote',
        userType: 'student',
        profilePictureUrl: 'https://example.com/avatar.jpg',
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue(mockPost),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getPostById('post-1');

    expect(result).toEqual({
      id: 'post-1',
      title: 'Test Post',
      content: 'Test Content',
      postType: 'basic',
      authorId: 'author-1',
      channelId: 'channel-1',
      channelName: 'General',
      isAnonymous: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      rating: 10,
      authorName: 'John Doe',
      userReaction: 'upvote',
      authorFirstName: 'John',
      authorLastName: 'Doe',
      authorUserType: 'student',
      authorProfilePictureUrl: 'https://example.com/avatar.jpg',
    });
  });

  it('should return post by id for unauthenticated user', async () => {
    mockGetUser.mockResolvedValue(undefined);

    const mockPost = [
      {
        id: 'post-1',
        title: 'Test Post',
        content: 'Test Content',
        postType: 'basic',
        authorId: 'author-1',
        channelId: null,
        channelName: null,
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        rating: 5,
        firstName: 'Jane',
        lastName: 'Smith',
        userReaction: null,
        userType: 'teacher',
        profilePictureUrl: null,
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue(mockPost),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getPostById('post-1');

    expect(result).toEqual({
      id: 'post-1',
      title: 'Test Post',
      content: 'Test Content',
      postType: 'basic',
      authorId: 'author-1',
      channelId: null,
      channelName: null,
      isAnonymous: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      rating: 5,
      authorName: 'Jane Smith',
      userReaction: null,
      authorFirstName: 'Jane',
      authorLastName: 'Smith',
      authorUserType: 'teacher',
      authorProfilePictureUrl: null,
    });
  });

  it('should return null when post does not exist', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getPostById('non-existent-post');

    expect(result).toBeNull();
  });

  it('should handle anonymous posts', async () => {
    const mockPost = [
      {
        id: 'post-1',
        title: 'Anonymous Post',
        content: 'Anonymous Content',
        postType: 'basic',
        authorId: 'author-1',
        channelId: null,
        channelName: null,
        isAnonymous: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        rating: 0,
        firstName: 'John',
        lastName: 'Doe',
        userReaction: null,
        userType: 'student',
        profilePictureUrl: null,
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue(mockPost),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getPostById('post-1');

    expect(result?.authorName).toBe('Anonymous');
    expect(result?.isAnonymous).toBe(true);
  });

  it('should handle posts without author (deleted user)', async () => {
    const mockPost = [
      {
        id: 'post-1',
        title: 'Orphaned Post',
        content: 'Orphaned Content',
        postType: 'basic',
        authorId: null,
        channelId: null,
        channelName: null,
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        rating: 0,
        firstName: null,
        lastName: null,
        userReaction: null,
        userType: null,
        profilePictureUrl: null,
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue(mockPost),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getPostById('post-1');

    expect(result?.authorName).toBe('Anonymous');
    expect(result?.authorId).toBeNull();
  });

  it('should handle posts with downvote reaction', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-123' } as never);

    const mockPost = [
      {
        id: 'post-1',
        title: 'Downvoted Post',
        content: 'Content',
        postType: 'basic',
        authorId: 'author-1',
        channelId: null,
        channelName: null,
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        rating: -5,
        firstName: 'John',
        lastName: 'Doe',
        userReaction: 'downvote',
        userType: 'student',
        profilePictureUrl: null,
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue(mockPost),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getPostById('post-1');

    expect(result?.rating).toBe(-5);
    expect(result?.userReaction).toBe('downvote');
  });

  it('should handle poll type posts', async () => {
    const mockPost = [
      {
        id: 'post-1',
        title: 'Poll Post',
        content: 'What do you think?',
        postType: 'poll',
        authorId: 'author-1',
        channelId: 'channel-1',
        channelName: 'Polls',
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        rating: 0,
        firstName: 'John',
        lastName: 'Doe',
        userReaction: null,
        userType: 'student',
        profilePictureUrl: null,
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue(mockPost),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getPostById('post-1');

    expect(result?.postType).toBe('poll');
  });

  it('should handle event type posts', async () => {
    const mockPost = [
      {
        id: 'post-1',
        title: 'Event Post',
        content: 'Join us for the event',
        postType: 'event',
        authorId: 'author-1',
        channelId: 'channel-1',
        channelName: 'Events',
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        rating: 15,
        firstName: 'Jane',
        lastName: 'Smith',
        userReaction: 'upvote',
        userType: 'teacher',
        profilePictureUrl: 'https://example.com/jane.jpg',
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue(mockPost),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getPostById('post-1');

    expect(result?.postType).toBe('event');
  });

  it('should handle posts with zero rating', async () => {
    const mockPost = [
      {
        id: 'post-1',
        title: 'Neutral Post',
        content: 'No reactions yet',
        postType: 'basic',
        authorId: 'author-1',
        channelId: null,
        channelName: null,
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        rating: 0,
        firstName: 'John',
        lastName: 'Doe',
        userReaction: null,
        userType: 'student',
        profilePictureUrl: null,
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue(mockPost),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getPostById('post-1');

    expect(result?.rating).toBe(0);
    expect(result?.userReaction).toBeNull();
  });

  it('should handle posts with channel information', async () => {
    const mockPost = [
      {
        id: 'post-1',
        title: 'Channel Post',
        content: 'Posted in channel',
        postType: 'basic',
        authorId: 'author-1',
        channelId: 'channel-123',
        channelName: 'Computer Science',
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        rating: 5,
        firstName: 'John',
        lastName: 'Doe',
        userReaction: null,
        userType: 'student',
        profilePictureUrl: null,
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue(mockPost),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getPostById('post-1');

    expect(result?.channelId).toBe('channel-123');
    expect(result?.channelName).toBe('Computer Science');
  });

  it('should handle posts without channel', async () => {
    const mockPost = [
      {
        id: 'post-1',
        title: 'No Channel Post',
        content: 'Not in any channel',
        postType: 'basic',
        authorId: 'author-1',
        channelId: null,
        channelName: null,
        isAnonymous: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        rating: 0,
        firstName: 'John',
        lastName: 'Doe',
        userReaction: null,
        userType: 'student',
        profilePictureUrl: null,
      },
    ];

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue(mockPost),
              }),
            }),
          }),
        }),
      }),
    } as never);

    const result = await getPostById('post-1');

    expect(result?.channelId).toBeNull();
    expect(result?.channelName).toBeNull();
  });
});
