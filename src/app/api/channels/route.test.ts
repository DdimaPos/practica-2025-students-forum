import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/ratelimits', () => ({
  rateLimits: {
    channelView: {
      limit: vi.fn(() =>
        Promise.resolve({
          success: true,
          limit: 10,
          remaining: 9,
          reset: Date.now() + 60000,
        })
      ),
    },
  },
}));

vi.mock('@/utils/getChannels', () => ({
  getChannels: vi.fn(() => Promise.resolve([])),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn(() => '127.0.0.1'),
  })),
}));

vi.mock('@/utils/getFirstIp', () => ({
  getFirstIP: vi.fn((ip: string) => ip || '127.0.0.1'),
}));

import { rateLimits } from '@/lib/ratelimits';
import { getChannels } from '@/utils/getChannels';

describe('GET /api/channels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return channels successfully', async () => {
    const mockChannels = [
      {
        id: 'channel-1',
        name: 'General Chat',
        description: 'General discussions',
        channelType: 'general',
      },
      {
        id: 'channel-2',
        name: 'CS Students',
        description: 'For CS students',
        channelType: 'academic',
      },
    ];

    vi.mocked(getChannels).mockResolvedValueOnce(mockChannels);

    const response = await GET();

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.channels).toEqual(mockChannels);
    expect(data.channels).toHaveLength(2);
  });

  it('should return empty array when no channels exist', async () => {
    vi.mocked(getChannels).mockResolvedValueOnce([]);

    const response = await GET();

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.channels).toEqual([]);
  });

  it('should return 429 when rate limit exceeded', async () => {
    vi.mocked(rateLimits.channelView.limit).mockResolvedValueOnce({
      success: false,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 60000,
      pending: Promise.resolve({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60000,
      } as never),
    });

    const response = await GET();

    expect(response.status).toBe(429);

    const data = await response.json();
    expect(data.error).toBe('Too many requests');
  });

  it('should return 500 when getChannels throws error', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    vi.mocked(getChannels).mockRejectedValueOnce(
      new Error('Database connection failed')
    );

    const response = await GET();

    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBe('Failed to fetch channels');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error in channels API:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('should call rate limiter with correct IP', async () => {
    await GET();

    expect(rateLimits.channelView.limit).toHaveBeenCalledWith('127.0.0.1');
  });

  it('should handle channels with all fields', async () => {
    const mockChannels = [
      {
        id: 'channel-1',
        name: 'Complete Channel',
        description: 'Full description here',
        channelType: 'academic',
      },
    ];

    vi.mocked(getChannels).mockResolvedValueOnce(mockChannels);

    const response = await GET();

    const data = await response.json();
    expect(data.channels[0]).toHaveProperty('id');
    expect(data.channels[0]).toHaveProperty('name');
    expect(data.channels[0]).toHaveProperty('description');
    expect(data.channels[0]).toHaveProperty('channelType');
  });

  it('should handle channels with null description', async () => {
    const mockChannels = [
      {
        id: 'channel-1',
        name: 'No Description',
        description: null,
        channelType: 'general',
      },
    ];

    vi.mocked(getChannels).mockResolvedValueOnce(mockChannels);

    const response = await GET();

    const data = await response.json();
    expect(data.channels[0].description).toBeNull();
  });
});
