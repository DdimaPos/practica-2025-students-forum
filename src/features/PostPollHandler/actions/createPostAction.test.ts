import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPostAction } from './createPost';
import db from '@/db';
import { sanitize, isValidUuid } from '@/lib/security';
import { revalidatePath } from 'next/cache';

vi.mock('@/db', () => ({
  default: {
    insert: vi.fn(),
  },
}));

vi.mock('@/db/schema', () => ({
  posts: {
    title: 'title',
    content: 'content',
    postType: 'postType',
    authorId: 'authorId',
    channelId: 'channelId',
    isAnonymous: 'isAnonymous',
    isActive: 'isActive',
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/security', () => ({
  sanitize: vi.fn(),
  isValidUuid: vi.fn(),
}));

describe('createPostAction', () => {
  const mockDb = vi.mocked(db);
  const mockSanitize = vi.mocked(sanitize);
  const mockIsValidUuid = vi.mocked(isValidUuid);
  const mockRevalidatePath = vi.mocked(revalidatePath);

  const validAuthorId = '123e4567-e89b-12d3-a456-426614174000';
  const validChannelId = '223e4567-e89b-12d3-a456-426614174001';

  beforeEach(() => {
    vi.clearAllMocks();
    mockSanitize.mockImplementation((input: string) => input);
    mockIsValidUuid.mockReturnValue(true);
  });

  it('should create a post successfully with required fields only', async () => {
    const mockPost = {
      id: '1',
      title: 'Test Title',
      content: 'Test Content',
      postType: 'basic',
      authorId: validAuthorId,
      channelId: null,
      isAnonymous: false,
      isActive: true,
      createdAt: new Date(),
    };

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockPost]),
      }),
    } as never);

    const result = await createPostAction({
      title: 'Test Title',
      content: 'Test Content',
      author_id: validAuthorId,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Post created successfully');
    expect(result.post).toEqual(mockPost);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/');
  });

  it('should create a post with all optional fields', async () => {
    const mockPost = {
      id: '1',
      title: 'Test Title',
      content: 'Test Content',
      postType: 'poll',
      authorId: validAuthorId,
      channelId: validChannelId,
      isAnonymous: true,
      isActive: false,
      createdAt: new Date(),
    };

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockPost]),
      }),
    } as never);

    const result = await createPostAction({
      title: 'Test Title',
      content: 'Test Content',
      post_type: 'poll',
      author_id: validAuthorId,
      channel_id: validChannelId,
      is_anonymous: true,
      is_active: false,
    });

    expect(result.success).toBe(true);
    expect(result.post?.postType).toBe('poll');
    expect(result.post?.isAnonymous).toBe(true);
    expect(result.post?.isActive).toBe(false);
  });

  it('should fail when title is missing', async () => {
    const result = await createPostAction({
      title: '',
      content: 'Test Content',
      author_id: validAuthorId,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Missing required fields: title, content, and author_id are required'
    );
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('should fail when content is missing', async () => {
    const result = await createPostAction({
      title: 'Test Title',
      content: '',
      author_id: validAuthorId,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Missing required fields: title, content, and author_id are required'
    );
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('should fail when author_id is missing', async () => {
    const result = await createPostAction({
      title: 'Test Title',
      content: 'Test Content',
      author_id: null,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Missing required fields: title, content, and author_id are required'
    );
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('should fail when author_id is not a valid UUID', async () => {
    mockIsValidUuid.mockReturnValueOnce(false);

    const result = await createPostAction({
      title: 'Test Title',
      content: 'Test Content',
      author_id: 'invalid-uuid',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid author ID format');
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('should fail when channel_id is not a valid UUID', async () => {
    mockIsValidUuid.mockReturnValueOnce(true).mockReturnValueOnce(false);

    const result = await createPostAction({
      title: 'Test Title',
      content: 'Test Content',
      author_id: validAuthorId,
      channel_id: 'invalid-uuid',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid channel ID format');
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('should sanitize title and content', async () => {
    const mockPost = {
      id: '1',
      title: 'Safe Title',
      content: 'Safe Content',
      postType: 'basic',
      authorId: validAuthorId,
      channelId: null,
      isAnonymous: false,
      isActive: true,
      createdAt: new Date(),
    };

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockPost]),
      }),
    } as never);

    await createPostAction({
      title: '<script>alert("xss")</script>Safe Title',
      content: '<script>alert("xss")</script>Safe Content',
      author_id: validAuthorId,
    });

    expect(mockSanitize).toHaveBeenCalledWith(
      '<script>alert("xss")</script>Safe Title'
    );
    expect(mockSanitize).toHaveBeenCalledWith(
      '<script>alert("xss")</script>Safe Content'
    );
  });

  it('should fail when sanitized title is empty', async () => {
    mockSanitize.mockReturnValue('   ');

    const result = await createPostAction({
      title: '<script></script>',
      content: 'Test Content',
      author_id: validAuthorId,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Title and content cannot be empty after sanitization'
    );
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('should fail when sanitized content is empty', async () => {
    mockSanitize.mockReturnValueOnce('Test Title').mockReturnValueOnce('   ');

    const result = await createPostAction({
      title: 'Test Title',
      content: '<script></script>',
      author_id: validAuthorId,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Title and content cannot be empty after sanitization'
    );
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('should default post_type to basic when not provided', async () => {
    const mockPost = {
      id: '1',
      title: 'Test Title',
      content: 'Test Content',
      postType: 'basic',
      authorId: validAuthorId,
      channelId: null,
      isAnonymous: false,
      isActive: true,
      createdAt: new Date(),
    };

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockPost]),
      }),
    } as never);

    const result = await createPostAction({
      title: 'Test Title',
      content: 'Test Content',
      author_id: validAuthorId,
    });

    expect(result.post?.postType).toBe('basic');
  });

  it('should default is_anonymous to false when not provided', async () => {
    const mockPost = {
      id: '1',
      title: 'Test Title',
      content: 'Test Content',
      postType: 'basic',
      authorId: validAuthorId,
      channelId: null,
      isAnonymous: false,
      isActive: true,
      createdAt: new Date(),
    };

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockPost]),
      }),
    } as never);

    const result = await createPostAction({
      title: 'Test Title',
      content: 'Test Content',
      author_id: validAuthorId,
    });

    expect(result.post?.isAnonymous).toBe(false);
  });

  it('should default is_active to true when not provided', async () => {
    const mockPost = {
      id: '1',
      title: 'Test Title',
      content: 'Test Content',
      postType: 'basic',
      authorId: validAuthorId,
      channelId: null,
      isAnonymous: false,
      isActive: true,
      createdAt: new Date(),
    };

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockPost]),
      }),
    } as never);

    const result = await createPostAction({
      title: 'Test Title',
      content: 'Test Content',
      author_id: validAuthorId,
    });

    expect(result.post?.isActive).toBe(true);
  });

  it('should handle database errors gracefully', async () => {
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockRejectedValue(new Error('Database connection failed')),
      }),
    } as never);

    const result = await createPostAction({
      title: 'Test Title',
      content: 'Test Content',
      author_id: validAuthorId,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Database connection failed');
  });

  it('should handle unknown errors gracefully', async () => {
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue('Unknown error'),
      }),
    } as never);

    const result = await createPostAction({
      title: 'Test Title',
      content: 'Test Content',
      author_id: validAuthorId,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Internal server error');
  });

  it('should create event type post', async () => {
    const mockPost = {
      id: '1',
      title: 'Event Title',
      content: 'Event Content',
      postType: 'event',
      authorId: validAuthorId,
      channelId: null,
      isAnonymous: false,
      isActive: true,
      createdAt: new Date(),
    };

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockPost]),
      }),
    } as never);

    const result = await createPostAction({
      title: 'Event Title',
      content: 'Event Content',
      post_type: 'event',
      author_id: validAuthorId,
    });

    expect(result.success).toBe(true);
    expect(result.post?.postType).toBe('event');
  });
});
