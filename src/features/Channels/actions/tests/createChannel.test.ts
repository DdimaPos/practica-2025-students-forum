import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db', () => ({
  default: {
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve(undefined)),
    })),
  },
}));

vi.mock('@/db/schema', () => ({
  channels: {
    name: 'name',
    description: 'description',
    channelType: 'channelType',
    facultyId: 'facultyId',
    specialityId: 'specialityId',
    createdBy: 'createdBy',
    isApproved: 'isApproved',
  },
}));

vi.mock('@/utils/getUser', () => ({
  getUser: vi.fn(() =>
    Promise.resolve({
      id: 'user-123',
      email: 'test@test.com',
    })
  ),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/security', () => ({
  sanitize: vi.fn((str?: string) => str?.trim() || ''),
  isValidUuid: vi.fn((uuid?: string) => {
    if (!uuid) return false;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    return uuidRegex.test(uuid);
  }),
}));

vi.mock('@/utils/getFirstIp', () => ({
  getFirstIP: vi.fn((ip: string) => ip || '127.0.0.1'),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn(() => '127.0.0.1'),
  })),
}));

vi.mock('@/lib/ratelimits', () => ({
  rateLimits: {
    createChannel: {
      limit: vi.fn(() => Promise.resolve({ success: true })),
    },
  },
}));

import { createChannel } from '../createChannel';
import db from '@/db';
import { getUser } from '@/utils/getUser';
import { revalidatePath } from 'next/cache';
import { rateLimits } from '@/lib/ratelimits';

describe('createChannel', () => {
  const prevState = {
    success: false,
    message: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rate Limiting', () => {
    it('should reject request when rate limit exceeded', async () => {
      vi.mocked(rateLimits.createChannel.limit).mockResolvedValueOnce({
        success: false,
      } as never);

      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'general');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Too many requests');
    });
  });

  describe('Authentication', () => {
    it('should reject request when user is not authenticated', async () => {
      vi.mocked(getUser).mockRejectedValueOnce(new Error('Not authenticated'));

      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'general');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('You must be logged in to create a channel');
    });

    it('should reject request when user is undefined', async () => {
      vi.mocked(getUser).mockResolvedValueOnce(undefined as never);

      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'general');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('You must be logged in to create a channel');
    });
  });

  describe('Validation - Name', () => {
    it('should reject when name is missing', async () => {
      const formData = new FormData();
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'general');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(false);
      expect(result.errors?.name).toContain(
        'Channel name must be at least 3 characters'
      );
    });

    it('should reject when name is too short', async () => {
      const formData = new FormData();
      formData.append('name', 'AB');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'general');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(false);
      expect(result.errors?.name).toContain(
        'Channel name must be at least 3 characters'
      );
    });

    it('should reject when name is too long', async () => {
      const formData = new FormData();
      formData.append('name', 'A'.repeat(101));
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'general');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(false);
      expect(result.errors?.name).toContain(
        'Channel name must be less than 100 characters'
      );
    });

    it('should accept name with exactly 3 characters', async () => {
      const formData = new FormData();
      formData.append('name', 'ABC');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'general');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(true);
    });

    it('should accept name with exactly 100 characters', async () => {
      const formData = new FormData();
      formData.append('name', 'A'.repeat(100));
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'general');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(true);
    });
  });

  describe('Validation - Description', () => {
    it('should reject when description is missing', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('channelType', 'general');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(false);
      expect(result.errors?.description).toContain(
        'Description must be at least 10 characters'
      );
    });

    it('should reject when description is too short', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Short');
      formData.append('channelType', 'general');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(false);
      expect(result.errors?.description).toContain(
        'Description must be at least 10 characters'
      );
    });

    it('should accept description with exactly 10 characters', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', '1234567890');
      formData.append('channelType', 'general');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(true);
    });
  });

  describe('Validation - Channel Type', () => {
    it('should reject when channelType is missing', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Test Description Here');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(false);
      expect(result.errors?.channelType).toContain(
        'Please select a valid channel type'
      );
    });

    it('should reject invalid channel type', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'invalid');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(false);
      expect(result.errors?.channelType).toContain(
        'Please select a valid channel type'
      );
    });

    it.each(['general', 'academic', 'social', 'announcements', 'local'])(
      'should accept valid channel type: %s',
      async channelType => {
        const formData = new FormData();
        formData.append('name', 'Test Channel');
        formData.append('description', 'Test Description Here');
        formData.append('channelType', channelType);

        const result = await createChannel(prevState, formData);

        expect(result.success).toBe(true);
      }
    );
  });

  describe('Validation - UUID Fields', () => {
    it('should reject invalid facultyId UUID', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'academic');
      formData.append('facultyId', 'invalid-uuid');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(false);
      expect(result.errors?.facultyId).toContain('Invalid faculty ID format');
    });

    it('should reject invalid specialityId UUID', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'academic');
      formData.append('specialityId', 'not-a-uuid');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(false);
      expect(result.errors?.specialityId).toContain(
        'Invalid speciality ID format'
      );
    });

    it('should accept valid facultyId UUID', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'academic');
      formData.append('facultyId', '550e8400-e29b-41d4-a716-446655440000');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(true);
    });

    it('should accept valid specialityId UUID', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'academic');
      formData.append('specialityId', '550e8400-e29b-41d4-a716-446655440000');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(true);
    });
  });

  describe('Successful Channel Creation', () => {
    it('should create channel with minimal required fields', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'general');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Channel created successfully!');
      expect(db.insert).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });

    it('should create channel with all fields', async () => {
      const formData = new FormData();
      formData.append('name', 'Computer Science');
      formData.append('description', 'Channel for CS students');
      formData.append('channelType', 'academic');
      formData.append('facultyId', '550e8400-e29b-41d4-a716-446655440000');
      formData.append('specialityId', '550e8400-e29b-41d4-a716-446655440001');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Channel created successfully!');
    });

    it('should sanitize input data', async () => {
      const { sanitize } = await import('@/lib/security');

      const formData = new FormData();
      formData.append('name', '  Test Channel  ');
      formData.append('description', '  Test Description  ');
      formData.append('channelType', 'general');

      await createChannel(prevState, formData);

      expect(sanitize).toHaveBeenCalledWith('  Test Channel  ');
      expect(sanitize).toHaveBeenCalledWith('  Test Description  ');
    });

    it('should set isApproved to true', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'general');

      await createChannel(prevState, formData);

      const insertCall = vi.mocked(db.insert);
      const valuesCall = insertCall.mock.results[0]?.value.values;

      expect(valuesCall).toHaveBeenCalledWith(
        expect.objectContaining({
          isApproved: true,
        })
      );
    });

    it('should set createdBy to current user id', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'general');

      await createChannel(prevState, formData);

      const insertCall = vi.mocked(db.insert);
      const valuesCall = insertCall.mock.results[0]?.value.values;

      expect(valuesCall).toHaveBeenCalledWith(
        expect.objectContaining({
          createdBy: 'user-123',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockRejectedValue(new Error('Database error')),
      } as never);

      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'general');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create channel. Please try again.');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should return multiple validation errors', async () => {
      const formData = new FormData();
      formData.append('name', 'AB');
      formData.append('description', 'Short');
      formData.append('channelType', 'invalid');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(false);
      expect(result.errors?.name).toBeDefined();
      expect(result.errors?.description).toBeDefined();
      expect(result.errors?.channelType).toBeDefined();
    });
  });

  describe('Optional Fields', () => {
    it('should handle missing facultyId gracefully', async () => {
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as never);

      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'general');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(true);
    });

    it('should handle missing specialityId gracefully', async () => {
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as never);

      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'general');

      const result = await createChannel(prevState, formData);

      expect(result.success).toBe(true);
    });

    it('should set facultyId to undefined when empty', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Channel');
      formData.append('description', 'Test Description Here');
      formData.append('channelType', 'general');
      formData.append('facultyId', '');

      await createChannel(prevState, formData);

      const insertCall = vi.mocked(db.insert);
      const valuesCall = insertCall.mock.results[0]?.value.values;

      expect(valuesCall).toHaveBeenCalledWith(
        expect.objectContaining({
          facultyId: undefined,
        })
      );
    });
  });
});
