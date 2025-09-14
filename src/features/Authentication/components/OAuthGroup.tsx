'use client';

import GoogleIcon from '@/components/generic/icons/Google';
import MicrosoftIcon from '@/components/generic/icons/Microsoft';
import {Button} from '@/components/ui/button';

export const OAuthGroup = () => {
  return (
    <div className='flex w-full justify-center gap-1'>
      <Button onClick={() => {}} variant='outline'>
        <GoogleIcon />
      </Button>
      <Button onClick={() => {}} variant='outline'>
        <MicrosoftIcon />
      </Button>
    </div>
  );
};
