import { SignInWithOAuthCredentials } from '@supabase/supabase-js';
import { ProviderTypes } from '../types';

const CALLBACK_PATH = `${
  process.env.NODE_ENV === 'production'
    ? 'https://peerplex-students-forum.vercel.app'
    : 'http://localhost:3000'
}/api/auth/callback`;

export const GOOGLE_AUTH_CONFIGURATION: Readonly<SignInWithOAuthCredentials> = {
  provider: ProviderTypes.GOOGLE,
  options: {
    redirectTo: CALLBACK_PATH,
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
    redirectTo: CALLBACK_PATH,
  },
};

export const GITHUB_OAUTH_CONFIGURATION: Readonly<SignInWithOAuthCredentials> =
  {
    provider: ProviderTypes.GITHUB,
    options: {
      scopes: 'email',
      redirectTo: CALLBACK_PATH,
    },
  };
