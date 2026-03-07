import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

type WrapperProps = { children: ReactNode };

export function QueryWrapper({ children }: WrapperProps) {
  const client = createTestQueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export function renderWithProviders(ui: ReactNode) {
  const client = createTestQueryClient();
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

export function createTestRouter(component: () => ReactNode) {
  const memoryHistory = createMemoryHistory({ initialEntries: ["/"] });
  return createRouter({
    history: memoryHistory,
    // @ts-expect-error minimal stub route tree for component testing
    routeTree: { id: "__root__", path: "/", component },
  });
}

export function renderWithRouter(ui: ReactNode) {
  const client = createTestQueryClient();

  const memoryHistory = createMemoryHistory({ initialEntries: ["/"] });
  const router = createRouter({
    history: memoryHistory,
    // @ts-expect-error minimal stub router for component testing
    routeTree: { id: "__root__", path: "/", component: () => ui },
  });

  return render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}
