import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock router navigation and Link before importing the component
vi.mock("@tanstack/react-router", () => ({
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
    <a href={to ?? "/"} className={className}>
      {children}
    </a>
  ),
}));

// Mock auth hooks
const mockLogin: {
  mutate: ReturnType<typeof vi.fn>;
  isPending: boolean;
  error: Error | null;
} = {
  mutate: vi.fn(),
  isPending: false,
  error: null,
};
vi.mock("../hooks/useAuth.js", () => ({
  useLogin: () => mockLogin,
}));

import { LoginPage } from "./LoginPage.js";

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <LoginPage />
    </QueryClientProvider>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    mockLogin.mutate = vi.fn();
    mockLogin.isPending = false;
    mockLogin.error = null;
  });

  it("renders the sign in heading", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /welcome back/i }),
    ).toBeInTheDocument();
  });

  it("renders email and password fields", () => {
    renderPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty submission", async () => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    });
    expect(mockLogin.mutate).not.toHaveBeenCalled();
  });

  it("calls login.mutate with form data on valid submission", async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText(/email/i), "hero@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(mockLogin.mutate).toHaveBeenCalledWith(
        { email: "hero@example.com", password: "password123" },
        expect.any(Object),
      );
    });
  });

  it("shows loading spinner when login is pending", () => {
    mockLogin.isPending = true;
    renderPage();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
  });

  it("shows server error message when ApiError is thrown", async () => {
    const { ApiError } = await import("../../../lib/api.js");
    mockLogin.error = new ApiError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS",
    );
    renderPage();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid email or password",
    );
  });

  it("has a link to the registration page", () => {
    renderPage();
    expect(
      screen.getByRole("link", { name: /create one/i }),
    ).toBeInTheDocument();
  });
});
