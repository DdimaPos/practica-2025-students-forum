import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/utils/getUser', () => ({
  getUser: vi.fn(() =>
    Promise.resolve({
      id: '550e8400-e29b-41d4-a716-446655440001',
    })
  ),
}));

vi.mock('@/db', () => ({
  default: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() =>
          Promise.resolve([
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'Test Post',
              content: 'Test Content',
              postType: 'basic',
              authorId: '550e8400-e29b-41d4-a716-446655440001',
              channelId: null,
              isAnonymous: false,
              isActive: true,
              createdAt: new Date(),
            },
          ])
        ),
      })),
    })),
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
    isActive: 'isActive',
    createdAt: 'createdAt',
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/security', () => ({
  sanitize: vi.fn((str: string) => str.trim()),
  isValidUuid: vi.fn((uuid: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    return uuidRegex.test(uuid);
  }),
}));


vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn(() => '127.0.0.1'),
  })),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
    getAll: vi.fn(() => []),
  })),
}));


vi.mock('@/utils/getFirstIp', () => ({
  getFirstIP: vi.fn((ip: string) => ip || '127.0.0.1'),
}));

vi.mock('@/lib/ratelimits', () => ({
  rateLimits: {
    createPost: {
      limit: vi.fn(() => Promise.resolve({ success: true })),
    },
  },
}));

import { createPostAction } from './createPost';

describe('createPostAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Positive Cases', () => {
    it('should create a post successfully with minimal required fields', async () => {
      const formData = {
        title: 'Test Post',
        content: 'Test Content',
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Post created successfully');
      expect(result.post).toBeDefined();
      expect(result.post?.title).toBe('Test Post');
    });

    it('should create a post with all optional fields', async () => {
      const formData = {
        title: 'Complete Post',
        content: 'Complete Content',
        post_type: 'poll' as const,
        channel_id: '550e8400-e29b-41d4-a716-446655440002',
        is_anonymous: true,
        is_active: false,
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(true);
      expect(result.post).toBeDefined();
    });

    it('should sanitize title and content', async () => {
      const { sanitize } = await import('@/lib/security');

      const formData = {
        title: '  Test Post  ',
        content: '  Test Content  ',
      };

      await createPostAction(formData);

      expect(sanitize).toHaveBeenCalledWith('  Test Post  ');
      expect(sanitize).toHaveBeenCalledWith('  Test Content  ');
    });

    it('should set default values correctly', async () => {
      const db = (await import('@/db')).default;

      const formData = {
        title: 'Test Post',
        content: 'Test Content',
      };

      await createPostAction(formData);

      const insertCall = vi.mocked(db.insert);
      const valuesCall = insertCall.mock.results[0]?.value.values;

      expect(valuesCall).toHaveBeenCalledWith(
        expect.objectContaining({
          postType: 'basic',
          channelId: null,
          isAnonymous: false,
          isActive: true,
        })
      );
    });

    it('should revalidate path after successful creation', async () => {
      const { revalidatePath } = await import('next/cache');

      const formData = {
        title: 'Test Post',
        content: 'Test Content',
      };

      await createPostAction(formData);

      expect(revalidatePath).toHaveBeenCalledWith('/');
    });
  });

  describe('Rate Limiting', () => {
    it('should return error when rate limit exceeded', async () => {
      const { rateLimits } = await import('@/lib/ratelimits');
      vi.mocked(rateLimits.createPost.limit).mockResolvedValueOnce({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60000,
        pending: Promise.resolve({
          success: false,
          limit: 10,
          remaining: 0,
          reset: Date.now() + 60000,
        }),
      });

      const formData = {
        title: 'Test Post',
        content: 'Test Content',
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Too many requests');
    });

    it('should extract IP from headers correctly', async () => {
      const { getFirstIP } = await import('@/utils/getFirstIp');

      const formData = {
        title: 'Test Post',
        content: 'Test Content',
      };

      await createPostAction(formData);

      expect(getFirstIP).toHaveBeenCalled();
    });
  });

  describe('Validation Errors', () => {
    it('should return error when title is missing', async () => {
      const formData = {
        title: '',
        content: 'Test Content',
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Missing required fields');
    });

    it('should return error when content is missing', async () => {
      const formData = {
        title: 'Test Post',
        content: '',
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Missing required fields');
    });

    it('should return error when user is not authenticated', async () => {
      const { getUser } = await import('@/utils/getUser');
      vi.mocked(getUser).mockResolvedValueOnce(undefined);

      const formData = {
        title: 'Test Post',
        content: 'Test Content',
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Missing required fields');
    });


    it('should return error for invalid channel UUID', async () => {
      const formData = {
        title: 'Test Post',
        content: 'Test Content',
        channel_id: 'invalid-channel-uuid',
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid channel ID format');
    });

    it('should return error when sanitized title is empty', async () => {
      const { sanitize } = await import('@/lib/security');
      vi.mocked(sanitize).mockReturnValueOnce('   ');

      const formData = {
        title: '   ',
        content: 'Test Content',
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('cannot be empty after sanitization');
    });

    it('should return error when sanitized content is empty', async () => {
      const { sanitize } = await import('@/lib/security');
      vi.mocked(sanitize)
        .mockReturnValueOnce('Test Post')
        .mockReturnValueOnce('   ');

      const formData = {
        title: 'Test Post',
        content: '   ',
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('cannot be empty after sanitization');
    });
  });

  describe('Security & Edge Cases', () => {
    it('should handle SQL injection attempts in title', async () => {
      const formData = {
        title: "'; DROP TABLE posts; --",
        content: 'Test Content',
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(true);
    });

    it('should handle XSS attempts in content', async () => {
      const formData = {
        title: 'Test Post',
        content: '<script>alert("XSS")</script>',
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(true);
    });

    it('should handle extremely long title', async () => {
      const formData = {
        title: 'A'.repeat(10000),
        content: 'Test Content',
      };

      const result = await createPostAction(formData);

      expect(result).toBeDefined();
    });

    it('should handle extremely long content', async () => {
      const formData = {
        title: 'Test Post',
        content: 'A'.repeat(100000),
      };

      const result = await createPostAction(formData);

      expect(result).toBeDefined();
    });

    it('should handle unicode characters', async () => {
      const formData = {
        title: '测试帖子 🎉',
        content: 'Тестовый контент с эмодзи 😊',
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(true);
    });

    it('should handle null channel_id correctly', async () => {
      const formData = {
        title: 'Test Post',
        content: 'Test Content',
        channel_id: null,
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(true);
    });

    it('should handle undefined is_active as true', async () => {
      const db = (await import('@/db')).default;

      const formData = {
        title: 'Test Post',
        content: 'Test Content',
      };

      await createPostAction(formData);

      const insertCall = vi.mocked(db.insert);
      const valuesCall = insertCall.mock.results[0]?.value.values;

      expect(valuesCall).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        })
      );
    });

    it('should handle explicit is_active false', async () => {
      const db = (await import('@/db')).default;

      const formData = {
        title: 'Test Post',
        content: 'Test Content',
        is_active: false,
      };

      await createPostAction(formData);

      const insertCall = vi.mocked(db.insert);
      const valuesCall = insertCall.mock.results[0]?.value.values;

      expect(valuesCall).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
        })
      );
    });
  });

  describe('Database Errors', () => {
    it('should handle database insert failure', async () => {
      const db = (await import('@/db')).default;
      const mockValues = vi.fn(() => ({
        returning: vi.fn(() => Promise.reject(new Error('Database error'))),
      }));

      vi.mocked(db.insert).mockReturnValueOnce({
        values: mockValues,
      } as unknown as ReturnType<typeof db.insert>);

      const formData = {
        title: 'Test Post',
        content: 'Test Content',
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Database error');
    });

    it('should handle unexpected errors gracefully', async () => {
      const db = (await import('@/db')).default;
      vi.mocked(db.insert).mockImplementationOnce(() => {
        throw 'Non-Error object thrown';
      });

      const formData = {
        title: 'Test Post',
        content: 'Test Content',
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Internal server error');
    });
  });

  describe('Post Types', () => {
    it('should accept "basic" post type', async () => {
      const formData = {
        title: 'Test Post',
        content: 'Test Content',
        post_type: 'basic' as const,
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(true);
    });

    it('should accept "poll" post type', async () => {
      const formData = {
        title: 'Test Post',
        content: 'Test Content',
        post_type: 'poll' as const,
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(true);
    });

    it('should accept "event" post type', async () => {
      const formData = {
        title: 'Test Post',
        content: 'Test Content',
        post_type: 'event' as const,
      };

      const result = await createPostAction(formData);

      expect(result.success).toBe(true);
    });
  });
});
