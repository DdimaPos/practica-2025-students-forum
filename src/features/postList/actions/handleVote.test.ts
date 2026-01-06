import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleVote } from './handleVote';

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: vi.fn(() => '127.0.0.1'),
  })),
}));

vi.mock('@/lib/ratelimits', () => ({
  rateLimits: {
    postVote: {
      limit: vi.fn(async () => ({ success: true })),
    },
  },
}));

vi.mock('./postVote', () => ({
  togglePostReaction: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/utils/getUser', () => ({
  getUser: vi.fn(),
}));

describe('handleVote', () => {
  let mockTogglePostReaction: ReturnType<typeof vi.fn>;
  let mockRevalidatePath: ReturnType<typeof vi.fn>;
  let mockGetUser: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const postVoteModule = await import('./postVote');
    const cacheModule = await import('next/cache');
    const getUserModule = await import('@/utils/getUser');

    mockTogglePostReaction = postVoteModule.togglePostReaction as ReturnType<
      typeof vi.fn
    >;
    mockRevalidatePath = cacheModule.revalidatePath as ReturnType<typeof vi.fn>;
    mockGetUser = getUserModule.getUser as ReturnType<typeof vi.fn>;
  });

  it('should handle vote successfully for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-123', email: 'test@test.com' });
    mockTogglePostReaction.mockResolvedValue({
      success: true,
      action: 'created',
      reactionType: 'upvote',
    });

    const result = await handleVote('post-1', 'upvote');

    expect(result).toEqual({
      success: true,
      action: 'created',
      reactionType: 'upvote',
    });
    expect(mockTogglePostReaction).toHaveBeenCalledWith(
      'post-1',
      'user-123',
      'upvote'
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith('/posts');
  });

  it('should reject vote when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue(null);

    const result = await handleVote('post-1', 'upvote');

    expect(result).toEqual({
      success: false,
      error: 'User not authenticated',
    });
    expect(mockTogglePostReaction).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('should reject vote when user has no id', async () => {
    mockGetUser.mockResolvedValue({ email: 'test@test.com' }); // no id

    const result = await handleVote('post-1', 'downvote');

    expect(result).toEqual({
      success: false,
      error: 'User not authenticated',
    });
    expect(mockTogglePostReaction).not.toHaveBeenCalled();
  });

  it('should handle downvote correctly', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-456' });
    mockTogglePostReaction.mockResolvedValue({
      success: true,
      action: 'updated',
      reactionType: 'downvote',
    });

    const result = await handleVote('post-2', 'downvote');

    expect(result.success).toBe(true);
    expect(mockTogglePostReaction).toHaveBeenCalledWith(
      'post-2',
      'user-456',
      'downvote'
    );
  });

  it('should not revalidate path when vote fails', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-789' });
    mockTogglePostReaction.mockResolvedValue({
      success: false,
      error: 'Database error',
    });

    const result = await handleVote('post-3', 'upvote');

    expect(result.success).toBe(false);
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('should handle removed reaction', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-100' });
    mockTogglePostReaction.mockResolvedValue({
      success: true,
      action: 'removed',
      reactionType: 'upvote',
    });

    const result = await handleVote('post-4', 'upvote');

    expect(result).toEqual({
      success: true,
      action: 'removed',
      reactionType: 'upvote',
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/posts');
  });
});
