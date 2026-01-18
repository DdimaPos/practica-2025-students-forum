import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db', () => ({
  default: {
    select: vi.fn(),
  },
}));

vi.mock('@/db/schema', () => ({
  channels: {
    id: 'id',
    name: 'name',
    description: 'description',
    channelType: 'channelType',
    createdAt: 'createdAt',
    isApproved: 'isApproved',
  },
  posts: {
    channelId: 'channelId',
    isActive: 'isActive',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  count: vi.fn(),
}));

vi.mock('@/lib/ratelimits', () => ({
  rateLimits: {
    channelView: {
      limit: vi.fn(() => Promise.resolve({ success: true })),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn(() => '127.0.0.1'),
  })),
}));

vi.mock('@/utils/getFirstIp', () => ({
  getFirstIP: vi.fn((ip: string) => ip || '127.0.0.1'),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

import { getChannelById } from '../getChannelById';
import db from '@/db';
import { rateLimits } from '@/lib/ratelimits';
import { redirect } from 'next/navigation';

describe('getChannelById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return channel with post count', async () => {
    const mockChannel = {
      id: 'channel-1',
      name: 'General Chat',
      description: 'General discussions',
      channelType: 'general',
      createdAt: new Date('2024-01-01'),
    };

    const mockSelect = vi.fn();
    vi.mocked(db.select).mockImplementation(() => {
      const callCount = mockSelect.mock.calls.length;
      mockSelect();

      if (callCount === 0) {
        // First call - channel query
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockChannel]),
            }),
          }),
        } as never;
      } else {
        // Second call - post count query
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 5 }]),
          }),
        } as never;
      }
    });

    const result = await getChannelById('channel-1');

    expect(result).toEqual({
      id: 'channel-1',
      name: 'General Chat',
      description: 'General discussions',
      channelType: 'general',
      createdAt: mockChannel.createdAt,
      postCount: 5,
    });
  });

  it('should return null when channel not found', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as never);

    const result = await getChannelById('non-existent');

    expect(result).toBeNull();
  });

  it('should return channel with zero posts', async () => {
    const mockChannel = {
      id: 'channel-1',
      name: 'New Channel',
      description: 'Brand new',
      channelType: 'general',
      createdAt: new Date('2024-01-01'),
    };

    const mockSelect = vi.fn();
    vi.mocked(db.select).mockImplementation(() => {
      const callCount = mockSelect.mock.calls.length;
      mockSelect();

      if (callCount === 0) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockChannel]),
            }),
          }),
        } as never;
      } else {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 0 }]),
          }),
        } as never;
      }
    });

    const result = await getChannelById('channel-1');

    expect(result?.postCount).toBe(0);
  });

  it('should redirect when rate limit exceeded', async () => {
    vi.mocked(rateLimits.channelView.limit).mockResolvedValueOnce({
      success: false,
    } as never);

    await expect(getChannelById('channel-1')).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/error');
  });

  it('should return null when database error occurs', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      }),
    } as never);

    const result = await getChannelById('channel-1');

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching channel:',
      'channel-1',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('should handle channel with null description', async () => {
    const mockChannel = {
      id: 'channel-1',
      name: 'No Description',
      description: null,
      channelType: 'general',
      createdAt: new Date('2024-01-01'),
    };

    const mockSelect = vi.fn();
    vi.mocked(db.select).mockImplementation(() => {
      const callCount = mockSelect.mock.calls.length;
      mockSelect();

      if (callCount === 0) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockChannel]),
            }),
          }),
        } as never;
      } else {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 3 }]),
          }),
        } as never;
      }
    });

    const result = await getChannelById('channel-1');

    expect(result?.description).toBeNull();
  });

  it('should handle channel with null createdAt', async () => {
    const mockChannel = {
      id: 'channel-1',
      name: 'Test Channel',
      description: 'Test',
      channelType: 'general',
      createdAt: null,
    };

    const mockSelect = vi.fn();
    vi.mocked(db.select).mockImplementation(() => {
      const callCount = mockSelect.mock.calls.length;
      mockSelect();

      if (callCount === 0) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockChannel]),
            }),
          }),
        } as never;
      } else {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 0 }]),
          }),
        } as never;
      }
    });

    const result = await getChannelById('channel-1');

    expect(result?.createdAt).toBeNull();
  });

  it('should only return approved channels', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as never);

    const result = await getChannelById('unapproved-channel');

    expect(result).toBeNull();
  });

  it('should count only active posts', async () => {
    const mockChannel = {
      id: 'channel-1',
      name: 'Active Posts',
      description: 'Channel with active posts only',
      channelType: 'general',
      createdAt: new Date('2024-01-01'),
    };

    const mockSelect = vi.fn();
    vi.mocked(db.select).mockImplementation(() => {
      const callCount = mockSelect.mock.calls.length;
      mockSelect();

      if (callCount === 0) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockChannel]),
            }),
          }),
        } as never;
      } else {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 10 }]),
          }),
        } as never;
      }
    });

    const result = await getChannelById('channel-1');

    expect(result?.postCount).toBe(10);
  });
});
