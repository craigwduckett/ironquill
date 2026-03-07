import { zodResolver } from '@hookform/resolvers/zod';
import { type LoginInput, LoginSchema } from '@ironquill/shared';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { Button, FormField } from '../../../components/ui/index.js';
import { ApiError } from '../../../lib/api.js';
import styles from '../../auth/AuthLayout/AuthLayout.module.css';
import { AuthLayout } from '../AuthLayout/AuthLayout.js';
import { useLogin } from '../hooks/useAuth.js';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = (data: LoginInput) => {
    login.mutate(data, {
      onSuccess: () => void navigate({ to: '/dashboard' }),
    });
  };

  const serverError = login.error instanceof ApiError ? login.error.message : null;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your adventure"
      footer={
        <>
          No account?{' '}
          <a href="/register" className={styles.footerLink}>
            Create one
          </a>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <div role="alert" className={styles.formError}>
            {serverError}
          </div>
        )}

        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" fullWidth isLoading={login.isPending}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
