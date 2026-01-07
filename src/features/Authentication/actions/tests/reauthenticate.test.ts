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
    reauthenticate: {
      limit: vi.fn(),
    },
  },
}));

import { redirect } from 'next/navigation';
import { createRedirectMock } from '@/test-utils/mocks/nextNavigation';
import { RecursivePartial } from '@/utils/types/recursivePartial';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { reauthenticate } from '../reauthenticate';
import { headers } from 'next/headers';
import { getFirstIP } from '@/utils/getFirstIp';

describe('reauthenticate actions scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(redirect).mockImplementation(createRedirectMock());
    vi.mocked(headers).mockResolvedValue({
      get: vi.fn(() => '127.0.0.1'),
    } as never);
    vi.mocked(getFirstIP).mockResolvedValue('127.0.0.1');
  });

  const formData = new FormData();
  formData.append('password', 'password123');

  const formState = { success: false, message: '' };

  it('redirect user to login page if not registered', async () => {
    const mockSupabase: RecursivePartial<SupabaseClient> = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          error: {
            message: 'error',
          },
          data: {
            user: null,
          },
        }),
        mfa: {
          getAuthenticatorAssuranceLevel: vi.fn(),
        },
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as SupabaseClient);

    await expect(reauthenticate(formState, formData)).rejects.toThrow(
      'NEXT_REDIRECT'
    );
    expect(redirect).toBeCalledWith('/login');
  });

  it('return false success if could not identify the user aal level', async () => {
    const mockSupabase: RecursivePartial<SupabaseClient> = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          error: null,
          data: { user: { id: 'user-1' } },
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

    expect(await reauthenticate(formState, formData)).toEqual({
      success: false,
      message: 'could not get aal level',
    });
  });

  it('do not reauthenticate if could not retrieve the user email', async () => {
    const mockSupabase: RecursivePartial<SupabaseClient> = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          error: null,
          data: { user: { id: 'user-1' } },
        }),
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

    expect(await reauthenticate(formState, formData)).toEqual({
      success: false,
      message: 'Not authenticated',
    });
  });

  it('return error if could not authenticate with email and password', async () => {
    const mockSupabase: RecursivePartial<SupabaseClient> = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          error: null,
          data: { user: { id: 'user-1', email: 'user@gmail.com' } },
        }),
        signInWithPassword: vi.fn().mockResolvedValue({
          error: { message: 'could not authenticate' },
          user: null,
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

    expect(await reauthenticate(formState, formData)).toEqual({
      success: false,
      message: 'could not authenticate',
    });
  });

  it('return error if could not authenticate with email and password', async () => {
    const mockSupabase: RecursivePartial<SupabaseClient> = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          error: null,
          data: { user: { id: 'user-1', email: 'user@gmail.com' } },
        }),
        signInWithPassword: vi.fn().mockResolvedValue({
          error: null,
          user: { id: 'user-1', email: 'user@gmail.com' },
        }),
        mfa: {
          getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
            data: {
              nextLevel: 'aal2',
            },
            error: null,
          }),
        },
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as SupabaseClient);

    await expect(reauthenticate(formState, formData)).rejects.toThrow(
      'NEXT_REDIRECT'
    );
    expect(redirect).toBeCalledWith('/reauth/mfa?page=/dashboard');
  });
});
