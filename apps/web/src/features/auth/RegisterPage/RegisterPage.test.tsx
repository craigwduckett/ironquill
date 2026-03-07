import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({
    children,
    className,
    to,
  }: {
    children: React.ReactNode;
    className?: string;
    to: string;
  }) => (
    <a href={to ?? '/'} className={className}>
      {children}
    </a>
  ),
}));

const mockRegister = { mutate: vi.fn(), isPending: false, error: null };
vi.mock('../hooks/useAuth.js', () => ({
  useRegister: () => mockRegister,
}));

import { RegisterPage } from './RegisterPage.js';

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <RegisterPage />
    </QueryClientProvider>,
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    mockRegister.mutate = vi.fn();
    mockRegister.isPending = false;
    mockRegister.error = null;
  });

  it('renders the create account heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders display name, email, and password fields', () => {
    renderPage();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty submission', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
    expect(mockRegister.mutate).not.toHaveBeenCalled();
  });

  it('calls register.mutate with form data on valid submission', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText(/display name/i), 'Aragorn');
    await userEvent.type(screen.getByLabelText(/email/i), 'aragorn@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(mockRegister.mutate).toHaveBeenCalledWith(
        {
          displayName: 'Aragorn',
          email: 'aragorn@example.com',
          password: 'password123',
        },
        expect.any(Object),
      );
    });
  });

  it('disables the submit button when registration is pending', () => {
    mockRegister.isPending = true;
    renderPage();
    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled();
  });

  it('has a link to the login page', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows a hint about the password requirements', () => {
    renderPage();
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });
});
