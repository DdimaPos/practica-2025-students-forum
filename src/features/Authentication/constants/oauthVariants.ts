import { SignInWithOAuthCredentials } from '@supabase/supabase-js';
import { ProviderTypes } from '../types';

export const GOOGLE_AUTH_CONFIGURATION: Readonly<SignInWithOAuthCredentials> = {
  provider: ProviderTypes.GOOGLE,
  options: {
    redirectTo: 'https://www.students-forum.vercel.app/api/auth/callback',
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
};

export const AZURE_OAUTH_CONFIGURATION: Readonly<SignInWithOAuthCredentials> = {
  provider: ProviderTypes.AZURE,
  options: {
    scopes: 'email',
    redirectTo: 'https://www.students-forum.vercel.app/api/auth/callback',
  },
};

export const GITHUB_OAUTH_CONFIGURATION: Readonly<SignInWithOAuthCredentials> =
  {
    provider: ProviderTypes.GITHUB,
    options: {
      scopes: 'email',
      redirectTo: 'http://localhost:3000/api/auth/callback',
    },
  };
