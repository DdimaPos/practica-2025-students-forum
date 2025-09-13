import {login} from '@/features/Authentication/actions/login';
import {LoginForm} from '@/features/Authentication/components/LoginForm';
export default function LoginPage() {
  return (
    <>
      <LoginForm onSubmit={login} />
    </>
  );
}
