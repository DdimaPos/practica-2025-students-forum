'use server';

import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ProviderTypes } from '../types';
import { SignInWithOAuthCredentials } from '@supabase/supabase-js';

import {
  GOOGLE_AUTH_CONFIGURATION,
  GITHUB_OAUTH_CONFIGURATION,
  AZURE_OAUTH_CONFIGURATION,
} from '../constants/oauthVariants';

export const oAuth = async (provider: ProviderTypes) => {
  const startTime = Date.now();

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
    });
    redirect('/error');
  }

  Sentry.metrics.distribution('auth.oauth.initiate', Date.now() - startTime, {
    unit: 'milliseconds',
  });

  const { data, error } =
    await supabase.auth.signInWithOAuth(activeOAuthVariant);

  if (data.url) {
    Sentry.logger.info('OAuth initiated', {
      action: 'oauth',
      provider: provider,
    });
    redirect(data.url);
  }

  if (error) {
    Sentry.logger.error('OAuth failed', {
      action: 'oauth',
      provider: provider,
    });
    redirect('/error');
  }
};
