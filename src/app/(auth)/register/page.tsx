import { signup } from '@/features/Authentication/actions/signup';
import { SignUpForm } from '@/features/Authentication/components/SignUpForm';

export default function LoginPage() {
  return (
    <>
      <SignUpForm onSubmit={signup} />
    </>
  );
}
