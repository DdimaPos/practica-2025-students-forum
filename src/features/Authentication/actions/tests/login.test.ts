import { beforeEach, vi, describe, it, expect } from 'vitest';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn(),
  }),
}));

vi.mock('@/utils/getFirstIp', () => ({
  getFirstIP: vi.fn(),
}));

vi.mock('@/lib/ratelimits', () => ({
  rateLimits: {
    login: {
      limit: vi.fn(),
    },
  },
}));

import { redirect } from 'next/navigation';
import { createRedirectMock } from '@/test-utils/mocks/nextNavigation';
import { RecursivePartial } from '@/utils/types/recursivePartial';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { login } from '../login';
import { headers } from 'next/headers';
import { rateLimits } from '@/lib/ratelimits';
import { getFirstIP } from '@/utils/getFirstIp';
import { rateLimitSuccess } from '../../../../test-utils/mocks/rateLimit';

describe('logic actions scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(redirect).mockImplementation(createRedirectMock());
    vi.mocked(headers).mockResolvedValue({
      get: vi.fn(() => '127.0.0.1'),
    } as never);
    vi.mocked(getFirstIP).mockResolvedValue('127.0.0.1');
    vi.mocked(rateLimits.login.limit).mockResolvedValue(rateLimitSuccess);
  });

  const formData = new FormData();
  formData.append('email', 'test@test.com');
  formData.append('password', 'password123');

  const formState = { success: false, message: '' };

  it('return false success if user cannot be signed in', async () => {
    const mockSupabase: RecursivePartial<SupabaseClient> = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          error: {
            message: 'error',
          },
          user: null,
        }),
        mfa: {
          getAuthenticatorAssuranceLevel: vi.fn(),
        },
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as SupabaseClient);

    expect(await login(formState, formData)).toEqual({
      success: false,
      message: 'Invalid credentials',
    });
  });

  it('return false success if user has wrong aal level', async () => {
    const mockSupabase: RecursivePartial<SupabaseClient> = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          error: null,
          user: { id: 'user-1' },
        }),
        mfa: {
          getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'could not get aal level' },
          }),
        },
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as SupabaseClient);

    expect(await login(formState, formData)).toEqual({
      success: false,
      message: 'could not get aal level',
    });
  });

  it('redirect the valid user to home page if aal level is 1 (no MFA)', async () => {
    const mockSupabase: RecursivePartial<SupabaseClient> = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          error: null,
          user: { id: 'user-1' },
        }),
        mfa: {
          getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
            data: {
              nextLevel: 'aal1',
            },
            error: null,
          }),
        },
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as SupabaseClient);

    await expect(login(formState, formData)).rejects.toThrow('NEXT_REDIRECT');

    expect(redirect).toBeCalledWith('/');
  });

  it('redirect the valid user to mfa page if aal level is 2', async () => {
    const mockSupabase: RecursivePartial<SupabaseClient> = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          error: null,
          user: { id: 'user-1' },
        }),
        mfa: {
          getAuthenticatorAssuranceLevel: vi
            .fn()
            .mockResolvedValue({ data: { nextLevel: 'aal2' }, error: null }),
        },
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as SupabaseClient);

    await expect(login(formState, formData)).rejects.toThrow('NEXT_REDIRECT');

    expect(redirect).toBeCalledWith('/login/mfa');
  });
});
