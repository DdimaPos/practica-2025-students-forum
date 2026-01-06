import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addReply } from './getReply';
import db from '@/db';
import { createClient } from '@/utils/supabase/server';
import { sanitize, isValidUuid } from '@/lib/security';

vi.mock('@/db', () => ({
  default: {
    insert: vi.fn(),
  },
}));

vi.mock('@/db/schema', () => ({
  comments: {
    authorId: 'authorId',
    parentCommentId: 'parentCommentId',
    content: 'content',
    isAnonymous: 'isAnonymous',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/security', () => ({
  sanitize: vi.fn(),
  isValidUuid: vi.fn(),
}));

describe('addReply', () => {
  const mockDb = vi.mocked(db);
  const mockCreateClient = vi.mocked(createClient);
  const mockSanitize = vi.mocked(sanitize);
  const mockIsValidUuid = vi.mocked(isValidUuid);

  const validPostId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUser = {
    id: 'user-123',
    email: 'test@test.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSanitize.mockImplementation((input?: string) => input ?? '');
    mockIsValidUuid.mockReturnValue(true);

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
        }),
      },
    } as never);
  });

  it('should add reply successfully', async () => {
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    } as never);

    await addReply(validPostId, 'Test reply', false);

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockSanitize).toHaveBeenCalledWith('Test reply');
  });

  it('should add anonymous reply', async () => {
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    } as never);

    await addReply(validPostId, 'Anonymous reply', true);

    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('should throw error for invalid post ID', async () => {
    mockIsValidUuid.mockReturnValue(false);

    await expect(addReply('invalid-id', 'Test reply')).rejects.toThrow(
      'Invalid post ID format'
    );

    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('should sanitize reply message', async () => {
    mockSanitize.mockReturnValue('Sanitized message');

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    } as never);

    await addReply(validPostId, '<script>alert("xss")</script>Unsafe message');

    expect(mockSanitize).toHaveBeenCalledWith(
      '<script>alert("xss")</script>Unsafe message'
    );
  });

  it('should throw error for empty message after sanitization', async () => {
    mockSanitize.mockReturnValue('   ');

    await expect(addReply(validPostId, '<script></script>')).rejects.toThrow(
      'Reply message cannot be empty'
    );

    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('should throw error for whitespace-only message', async () => {
    mockSanitize.mockReturnValue('   ');

    await expect(addReply(validPostId, '   ')).rejects.toThrow(
      'Reply message cannot be empty'
    );

    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('should not add reply when user is not authenticated', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    } as never);

    await addReply(validPostId, 'Test reply');

    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('should default isAnonymous to false when not provided', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({
      values: mockValues,
    } as never);

    await addReply(validPostId, 'Test reply');

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        isAnonymous: false,
      })
    );
  });

  it('should set correct authorId from authenticated user', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({
      values: mockValues,
    } as never);

    await addReply(validPostId, 'Test reply');

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        authorId: 'user-123',
      })
    );
  });

  it('should set parentCommentId correctly', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({
      values: mockValues,
    } as never);

    await addReply(validPostId, 'Test reply');

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        parentCommentId: validPostId,
      })
    );
  });

  it('should set createdAt to current date', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({
      values: mockValues,
    } as never);

    const beforeCall = new Date();
    await addReply(validPostId, 'Test reply');
    const afterCall = new Date();

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: expect.any(Date),
        updatedAt: null,
      })
    );

    const calledDate = mockValues.mock.calls[0][0].createdAt;
    expect(calledDate.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
    expect(calledDate.getTime()).toBeLessThanOrEqual(afterCall.getTime());
  });

  it('should handle long reply messages', async () => {
    const longMessage = 'A'.repeat(5000);
    mockSanitize.mockReturnValue(longMessage);

    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({
      values: mockValues,
    } as never);

    await addReply(validPostId, longMessage);

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        content: longMessage,
      })
    );
  });

  it('should handle database errors gracefully', async () => {
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockRejectedValue(new Error('Database error')),
    } as never);

    await expect(addReply(validPostId, 'Test reply')).rejects.toThrow(
      'Database error'
    );
  });

  it('should handle authentication errors gracefully', async () => {
    mockCreateClient.mockRejectedValue(new Error('Auth error'));

    await expect(addReply(validPostId, 'Test reply')).rejects.toThrow(
      'Auth error'
    );
  });

  it('should trim whitespace from message after sanitization', async () => {
    mockSanitize.mockReturnValue('  Valid message  ');

    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({
      values: mockValues,
    } as never);

    await addReply(validPostId, '  Valid message  ');

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '  Valid message  ',
      })
    );
  });

  it('should handle special characters in message', async () => {
    const specialMessage = 'Test with émojis 🎉 and spëcial çhars!';
    mockSanitize.mockReturnValue(specialMessage);

    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({
      values: mockValues,
    } as never);

    await addReply(validPostId, specialMessage);

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        content: specialMessage,
      })
    );
  });
});
