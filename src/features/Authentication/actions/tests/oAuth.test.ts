import { beforeEach, describe, expect, it, vi } from 'vitest';

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

import { redirect } from 'next/navigation';
import { ProviderTypes } from '../../types';
import { oAuth } from '../oAuth';
import { createRedirectMock } from '@/test-utils/mocks/nextNavigation';
import { RecursivePartial } from '@/utils/types/recursivePartial';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import { getFirstIP } from '@/utils/getFirstIp';

describe('OAuth action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(redirect).mockImplementation(createRedirectMock());
    vi.mocked(headers).mockResolvedValue({
      get: vi.fn(() => '127.0.0.1'),
    } as never);
    vi.mocked(getFirstIP).mockResolvedValue('127.0.0.1');
  });

  describe('OAuth config map picking', () => {
    const mockSupabase: RecursivePartial<SupabaseClient> = {
      auth: {
        signInWithOAuth: vi.fn().mockResolvedValue({
          data: {
            url: 'redirect url',
          },
        }),
      },
    };

    beforeEach(() => {
      vi.mocked(createClient).mockResolvedValue(mockSupabase as SupabaseClient);
    });

    it('correctly picks google oauth config map', async () => {
      await expect(oAuth(ProviderTypes.GOOGLE)).rejects.toThrow(
        'NEXT_REDIRECT'
      );
      expect(redirect).toBeCalledWith('redirect url');
    });

    it('correctly picks GitHub oauth config map', async () => {
      await expect(oAuth(ProviderTypes.GITHUB)).rejects.toThrow(
        'NEXT_REDIRECT'
      );
      expect(redirect).toBeCalledWith('redirect url');
    });

    it('correctly picks Azure oauth config map', async () => {
      await expect(oAuth(ProviderTypes.AZURE)).rejects.toThrow('NEXT_REDIRECT');
      expect(redirect).toBeCalledWith('redirect url');
    });

    it('redirects to error page if wrong oauth provider was passed', async () => {
      await expect(oAuth('nonsuportedOAuth' as ProviderTypes)).rejects.toThrow(
        'NEXT_REDIRECT'
      );
      expect(redirect).toBeCalledWith('/error');
    });
  });

  describe('Oauth error received from supabase', () => {
    const mockSupabase: RecursivePartial<SupabaseClient> = {
      auth: {
        signInWithOAuth: vi.fn().mockResolvedValue({
          data: {
            url: null,
          },
          error: { code: 'validation_failed' },
        }),
      },
    };

    beforeEach(() => {
      vi.mocked(createClient).mockResolvedValue(mockSupabase as SupabaseClient);
    });

    it('redirect to error page if supabase returned error', async () => {
      await expect(oAuth(ProviderTypes.GOOGLE)).rejects.toThrow(
        'NEXT_REDIRECT'
      );
      expect(redirect).toBeCalledWith('/error');
    });
  });
});
