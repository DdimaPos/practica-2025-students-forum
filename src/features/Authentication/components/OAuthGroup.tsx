'use client';

import { ProviderTypes } from '../types';
import { oAuth } from '../actions/oAuth';

import { Button } from '@/components/ui/button';
import GoogleIcon from '@/components/generic/icons/Google';
import MicrosoftIcon from '@/components/generic/icons/Microsoft';
import GithubIcon from '@/components/generic/icons/Github';

export const OAuthGroup = () => {
  return (
    <div className='flex w-full justify-center gap-1'>
      <Button onClick={() => oAuth(ProviderTypes.GOOGLE)} variant='outline'>
        <GoogleIcon />
      </Button>
      <Button onClick={() => oAuth(ProviderTypes.AZURE)} variant='outline'>
        <MicrosoftIcon />
      </Button>
      <Button onClick={() => oAuth(ProviderTypes.GITHUB)} variant='outline'>
        <GithubIcon />
      </Button>
    </div>
  );
};
