import { zodResolver } from '@hookform/resolvers/zod';
import { type RegisterInput, RegisterSchema } from '@ironquill/shared';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { Button, FormField } from '../../../components/ui/index.js';
import { ApiError } from '../../../lib/api.js';
import styles from '../../auth/AuthLayout/AuthLayout.module.css';
import { AuthLayout } from '../AuthLayout/AuthLayout.js';
import { useRegister } from '../hooks/useAuth.js';

export function RegisterPage() {
  const navigate = useNavigate();
  const register_ = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(RegisterSchema) });

  const onSubmit = (data: RegisterInput) => {
    register_.mutate(data, {
      onSuccess: () => void navigate({ to: '/dashboard' }),
    });
  };

  const serverError = register_.error instanceof ApiError ? register_.error.message : null;

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start building your adventure"
      footer={
        <>
          Already have an account?{' '}
          <a href="/login" className={styles.footerLink}>
            Sign in
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
          id="displayName"
          label="Display name"
          type="text"
          autoComplete="name"
          required
          error={errors.displayName?.message}
          hint="This is how other players will see you"
          {...register('displayName')}
        />

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
          autoComplete="new-password"
          required
          error={errors.password?.message}
          hint="At least 8 characters"
          {...register('password')}
        />

        <Button type="submit" fullWidth isLoading={register_.isPending}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
