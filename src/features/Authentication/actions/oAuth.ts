'use server';

import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ProviderTypes } from '../types';
import { SignInWithOAuthCredentials } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { getFirstIP } from '@/utils/getFirstIp';

import {
  GOOGLE_AUTH_CONFIGURATION,
  GITHUB_OAUTH_CONFIGURATION,
  AZURE_OAUTH_CONFIGURATION,
} from '../constants/oauthVariants';

export const oAuth = async (provider: ProviderTypes) => {
  const startTime = Date.now();
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');

  const supabase = await createClient();

  const configMap: Record<ProviderTypes, SignInWithOAuthCredentials> = {
    [ProviderTypes.GOOGLE]: GOOGLE_AUTH_CONFIGURATION,
    [ProviderTypes.GITHUB]: GITHUB_OAUTH_CONFIGURATION,
    [ProviderTypes.AZURE]: AZURE_OAUTH_CONFIGURATION,
  };

  const activeOAuthVariant = configMap[provider];

  if (!activeOAuthVariant) {
    Sentry.logger.error('Invalid OAuth provider', {
      action: 'oauth',
      provider: provider,
      ip_address: ip,
      duration: Date.now() - startTime,
    });
    redirect('/error');
  }

  const { data, error } =
    await supabase.auth.signInWithOAuth(activeOAuthVariant);

  if (data.url) {
    Sentry.logger.info('OAuth initiated', {
      action: 'oauth',
      provider: provider,
      ip_address: ip,
      duration: Date.now() - startTime,
    });
    redirect(data.url);
  }

  if (error) {
    Sentry.logger.error('OAuth failed', {
      action: 'oauth',
      provider: provider,
      ip_address: ip,
      duration: Date.now() - startTime,
    });
    redirect('/error');
  }
};
