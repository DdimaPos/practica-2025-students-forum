import { EnrollMFA } from '@/features/Authentication/components/EnrollMFA';

export default function MFASettingsPage() {
  return (
    <div className='mx-auto mt-10 max-w-md space-y-6'>
      <h1 className='text-2xl font-bold'>Multi-Factor Authentication</h1>
      <EnrollMFA />
    </div>
  );
}
