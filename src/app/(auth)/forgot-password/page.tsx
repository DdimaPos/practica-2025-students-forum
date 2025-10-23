import { resetPasswordRequest } from '@/features/Authentication/actions/resetPasswordRequest';
import { RequestPasswordResetForm } from '@/features/Authentication/components/RequestPasswordResetForm';

export default function ForgotPasswordPage() {
  return <RequestPasswordResetForm onSubmit={resetPasswordRequest} />;
}
