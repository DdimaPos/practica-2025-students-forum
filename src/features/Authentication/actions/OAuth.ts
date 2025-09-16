'use server';

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
  const supabase = await createClient();

  const configMap: Record<ProviderTypes, SignInWithOAuthCredentials> = {
    [ProviderTypes.GOOGLE]: GOOGLE_AUTH_CONFIGURATION,
    [ProviderTypes.GITHUB]: GITHUB_OAUTH_CONFIGURATION,
    [ProviderTypes.AZURE]: AZURE_OAUTH_CONFIGURATION,
  };

  const activeOAuthVariant = configMap[provider];

  if (!activeOAuthVariant) {
    redirect('/error');
  }

  const { data, error } =
    await supabase.auth.signInWithOAuth(activeOAuthVariant);

  if (data.url) redirect(data.url);
  if (error) redirect('/error');
  redirect('/');
};
