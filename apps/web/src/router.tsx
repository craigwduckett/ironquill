import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { lazy } from "react";
import { AppShell } from "./components/layout/AppShell/AppShell.js";
import { useAuthStore } from "./stores/auth.js";

// ── Root ─────────────────────────────────────────────────────────────────────

const RouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/router-devtools").then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    )
  : ((() => null) as () => null);

const rootRoute = createRootRoute({
  component: () => (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      <RouterDevtools />
    </>
  ),
});

// ── Routes ────────────────────────────────────────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <main>
      <h1>IronQuill</h1>
      <p>Your D&amp;D adventure companion.</p>
    </main>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <main>
      <h1>Sign In</h1>
    </main>
  ),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: () => (
    <main>
      <h1>Create Account</h1>
    </main>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: ({ navigate }) => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) {
      void navigate({ to: "/login" });
    }
  },
  component: () => {
    const { user } = useAuthStore();
    return (
      <main>
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.displayName}</p>
      </main>
    );
  },
});

// ── Router ────────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  dashboardRoute,
]);

export const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
