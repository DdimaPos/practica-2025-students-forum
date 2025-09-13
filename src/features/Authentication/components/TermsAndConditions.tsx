import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import Link from 'next/link';

export const TermsAndConditions = () => {
  return (
    <div className='flex items-center space-x-2'>
      <Checkbox id='terms' name='terms' required />
      <Label htmlFor='terms' className='text-sm'>
        I agree to the{' '}
        <Link
          href='/terms'
          className='hover:text-primary underline underline-offset-4'
        >
          Terms and Conditions
        </Link>
      </Label>
    </div>
  );
};
