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
    isApproved: 'isApproved',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  asc: vi.fn(),
}));

import { getChannels } from './getChannels';
import db from '@/db';

describe('getChannels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return approved channels', async () => {
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

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockChannels),
        }),
      }),
    } as never);

    const result = await getChannels();

    expect(result).toEqual(mockChannels);
    expect(result).toHaveLength(2);
  });

  it('should return empty array when no channels exist', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as never);

    const result = await getChannels();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should only return approved channels', async () => {
    const mockChannels = [
      {
        id: 'channel-1',
        name: 'Approved Channel',
        description: 'This is approved',
        channelType: 'general',
      },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockChannels),
        }),
      }),
    } as never);

    const result = await getChannels();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Approved Channel');
  });

  it('should order channels by name', async () => {
    const mockChannels = [
      {
        id: 'channel-1',
        name: 'Announcements',
        description: 'Official announcements',
        channelType: 'announcements',
      },
      {
        id: 'channel-2',
        name: 'General',
        description: 'General chat',
        channelType: 'general',
      },
      {
        id: 'channel-3',
        name: 'Study Groups',
        description: 'Find study partners',
        channelType: 'academic',
      },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockChannels),
        }),
      }),
    } as never);

    const result = await getChannels();

    expect(result[0].name).toBe('Announcements');
    expect(result[1].name).toBe('General');
    expect(result[2].name).toBe('Study Groups');
  });

  it('should return channels with all channel types', async () => {
    const mockChannels = [
      { id: '1', name: 'General', description: null, channelType: 'general' },
      { id: '2', name: 'Academic', description: null, channelType: 'academic' },
      { id: '3', name: 'Social', description: null, channelType: 'social' },
      {
        id: '4',
        name: 'Announcements',
        description: null,
        channelType: 'announcements',
      },
      { id: '5', name: 'Local', description: null, channelType: 'local' },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockChannels),
        }),
      }),
    } as never);

    const result = await getChannels();

    expect(result).toHaveLength(5);
    expect(result.map(c => c.channelType)).toContain('general');
    expect(result.map(c => c.channelType)).toContain('academic');
    expect(result.map(c => c.channelType)).toContain('social');
    expect(result.map(c => c.channelType)).toContain('announcements');
    expect(result.map(c => c.channelType)).toContain('local');
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

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockChannels),
        }),
      }),
    } as never);

    const result = await getChannels();

    expect(result[0].description).toBeNull();
  });

  it('should handle database errors', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      }),
    } as never);

    await expect(getChannels()).rejects.toThrow('Database error');
  });

  it('should map all required fields', async () => {
    const mockChannels = [
      {
        id: 'channel-1',
        name: 'Test Channel',
        description: 'Test Description',
        channelType: 'general',
      },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockChannels),
        }),
      }),
    } as never);

    const result = await getChannels();

    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('description');
    expect(result[0]).toHaveProperty('channelType');
  });
});
