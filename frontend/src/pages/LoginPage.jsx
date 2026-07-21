// components
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout title="Log in" subtitle="Enter your email and password to access the product catalog.">
      <LoginForm />
    </AuthLayout>
  );
}
