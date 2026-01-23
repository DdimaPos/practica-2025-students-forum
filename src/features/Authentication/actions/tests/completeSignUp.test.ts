import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/supabase/server', () => {
  return {
    createClient: vi.fn(),
  };
});

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/db', () => {
  return {
    db: vi.fn(),
  };
});

vi.mock('@/db/schema', () => {
  return {
    users: {},
  };
});

vi.mock('drizzle-orm', () => {
  return {
    eq: vi.fn(),
  };
});

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { completeSignup } from '../completeSignup';
import { createRedirectMock } from '@/test-utils/mocks/nextNavigation';
import { RecursivePartial } from '@/utils/types/recursivePartial';
import { SupabaseClient } from '@supabase/supabase-js';
import { completeSignupFormSchema } from '../../types';

describe('complete Sign up action', () => {
  beforeEach(() => vi.clearAllMocks());
  const formData = new FormData();
  formData.append('firstName', 'John');
  formData.append('lastName', 'Cena');
  formData.append('bio', 'a'.repeat(300));
  formData.append('yearOfStudy', '2');

  const formState = { success: false, message: '' };

  it('should redirect to login if the user is not returned', async () => {
    const mockUser: RecursivePartial<SupabaseClient> = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockUser as SupabaseClient);

    vi.mocked(redirect).mockImplementation(createRedirectMock());
    await expect(completeSignup(formState, formData)).rejects.toThrow(
      'NEXT_REDIRECT'
    );
    expect(redirect).toBeCalledWith('/login');
    expect(redirect).toBeCalledTimes(1);
  });

  describe('complete signup input validations', () => {
    it('validate if everything is correct', () => {
      const validForm = {
        firstName: 'John',
        lastName: 'Cena',
        bio: 'cool man',
        yearOfStudy: '3',
      };

      const result = completeSignupFormSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it('invalidate if no first name', () => {
      const invalidForm = {
        firstName: undefined,
        lastName: 'Cena',
        bio: 'bla bla car',
        yearOfStudy: '2',
      };

      const result = completeSignupFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it('invalidate if no last name', () => {
      const invalidForm = {
        firstName: 'John',
        bio: 'bla bla car',
        yearOfStudy: '2',
      };

      const result = completeSignupFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it('invalidate if no bio', () => {
      const invalidForm = {
        firstName: 'John',
        lastName: 'Cena',
        yearOfStudy: '2',
      };

      const result = completeSignupFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it('invalidate if bio too long', () => {
      const invalidForm = {
        firstName: 'John',
        lastName: 'Cena',
        bio: 'a'.repeat(300),
        yearOfStudy: '2',
      };

      const result = completeSignupFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it('invalidate if no year of study', () => {
      const invalidForm = {
        firstName: 'John',
        lastName: 'Cena',
        bio: new String(Array(300).fill('a').join('')),
      };

      const result = completeSignupFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it('invalidate if invalid year of study', () => {
      const invalidForm = {
        firstName: 'John',
        lastName: 'Cena',
        bio: 'cool man',
        yearOfStudy: 10,
      };

      const result = completeSignupFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });
  });
});
