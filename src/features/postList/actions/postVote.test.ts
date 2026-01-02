import { describe, it, expect, vi, beforeEach } from 'vitest';
import { togglePostReaction } from './postVote';
import db from '@/db';

vi.mock('@/db', () => ({
  default: {
    select: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock('@/db/schema', () => ({
  postReactions: {
    postId: 'postId',
    userId: 'userId',
    reactionType: 'reactionType',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
}));

describe('togglePostReaction', () => {
  const mockDb = vi.mocked(db);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new reaction when none exists', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as never);

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    } as never);

    const result = await togglePostReaction('post-1', 'user-1', 'upvote');

    expect(result).toEqual({
      success: true,
      action: 'created',
      reactionType: 'upvote',
    });
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('should remove reaction when clicking the same reaction type', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([
              { postId: 'post-1', userId: 'user-1', reactionType: 'upvote' },
            ]),
        }),
      }),
    } as never);

    mockDb.delete.mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    } as never);

    const result = await togglePostReaction('post-1', 'user-1', 'upvote');

    expect(result).toEqual({
      success: true,
      action: 'removed',
      reactionType: 'upvote',
    });
    expect(mockDb.delete).toHaveBeenCalled();
  });

  it('should update reaction when clicking different reaction type', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([
              { postId: 'post-1', userId: 'user-1', reactionType: 'upvote' },
            ]),
        }),
      }),
    } as never);

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    } as never);

    const result = await togglePostReaction('post-1', 'user-1', 'downvote');

    expect(result).toEqual({
      success: true,
      action: 'updated',
      reactionType: 'downvote',
    });
    expect(mockDb.update).toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      }),
    } as never);

    const result = await togglePostReaction('post-1', 'user-1', 'upvote');

    expect(result).toEqual({
      success: false,
      error: 'Failed to update reaction',
    });
  });
});
