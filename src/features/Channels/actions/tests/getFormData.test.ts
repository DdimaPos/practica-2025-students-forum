import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db', () => ({
  default: {
    select: vi.fn(),
  },
}));

vi.mock('@/db/schema', () => ({
  faculties: {
    id: 'id',
    name: 'name',
  },
  specialities: {
    id: 'id',
    name: 'name',
    facultyId: 'facultyId',
  },
}));

vi.mock('drizzle-orm', () => ({
  asc: vi.fn(),
}));

import { getFaculties, getSpecialities } from '../getFormData';
import db from '@/db';

describe('getFaculties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return list of faculties', async () => {
    const mockFaculties = [
      { id: 'faculty-1', name: 'Computer Science' },
      { id: 'faculty-2', name: 'Engineering' },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue(mockFaculties),
      }),
    } as never);

    const result = await getFaculties();

    expect(result).toEqual(mockFaculties);
    expect(result).toHaveLength(2);
  });

  it('should return empty array when no faculties exist', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue([]),
      }),
    } as never);

    const result = await getFaculties();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should order faculties by name', async () => {
    const mockFaculties = [
      { id: 'faculty-1', name: 'Architecture' },
      { id: 'faculty-2', name: 'Biology' },
      { id: 'faculty-3', name: 'Computer Science' },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue(mockFaculties),
      }),
    } as never);

    const result = await getFaculties();

    expect(result[0].name).toBe('Architecture');
    expect(result[1].name).toBe('Biology');
    expect(result[2].name).toBe('Computer Science');
  });

  it('should handle database errors', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockRejectedValue(new Error('Database error')),
      }),
    } as never);

    await expect(getFaculties()).rejects.toThrow('Database error');
  });
});

describe('getSpecialities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return list of specialities', async () => {
    const mockSpecialities = [
      { id: 'spec-1', name: 'Software Engineering', facultyId: 'faculty-1' },
      { id: 'spec-2', name: 'Data Science', facultyId: 'faculty-1' },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue(mockSpecialities),
      }),
    } as never);

    const result = await getSpecialities();

    expect(result).toEqual(mockSpecialities);
    expect(result).toHaveLength(2);
  });

  it('should return empty array when no specialities exist', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue([]),
      }),
    } as never);

    const result = await getSpecialities();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should include facultyId in speciality data', async () => {
    const mockSpecialities = [
      { id: 'spec-1', name: 'AI', facultyId: 'faculty-1' },
      { id: 'spec-2', name: 'ML', facultyId: 'faculty-2' },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue(mockSpecialities),
      }),
    } as never);

    const result = await getSpecialities();

    expect(result[0].facultyId).toBe('faculty-1');
    expect(result[1].facultyId).toBe('faculty-2');
  });

  it('should handle specialities with null facultyId', async () => {
    const mockSpecialities = [
      { id: 'spec-1', name: 'General Studies', facultyId: null },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue(mockSpecialities),
      }),
    } as never);

    const result = await getSpecialities();

    expect(result[0].facultyId).toBeNull();
  });

  it('should order specialities by name', async () => {
    const mockSpecialities = [
      { id: 'spec-1', name: 'Algorithms', facultyId: 'faculty-1' },
      { id: 'spec-2', name: 'Databases', facultyId: 'faculty-1' },
      { id: 'spec-3', name: 'Networks', facultyId: 'faculty-1' },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue(mockSpecialities),
      }),
    } as never);

    const result = await getSpecialities();

    expect(result[0].name).toBe('Algorithms');
    expect(result[1].name).toBe('Databases');
    expect(result[2].name).toBe('Networks');
  });

  it('should handle database errors', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockRejectedValue(new Error('Connection failed')),
      }),
    } as never);

    await expect(getSpecialities()).rejects.toThrow('Connection failed');
  });
});
