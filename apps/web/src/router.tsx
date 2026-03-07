import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { lazy } from "react";
import { AppShell } from "./components/layout/AppShell/AppShell.js";
import { LegalPage } from "./features/legal/LegalPage/index.js";
import { TermsPage } from "./features/legal/TermsPage/index.js";
import { PrivacyPage } from "./features/legal/PrivacyPage/index.js";
import { SrdAttributionsPage } from "./features/legal/SrdAttributionsPage/index.js";
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

// ── Legal routes ─────────────────────────────────────────────────────────────

const legalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/legal",
  component: LegalPage,
});

const legalTermsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/legal/terms",
  component: TermsPage,
});

const legalPrivacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/legal/privacy",
  component: PrivacyPage,
});

const legalSrdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/legal/srd",
  component: SrdAttributionsPage,
});

// ── Router ────────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  dashboardRoute,
  legalRoute,
  legalTermsRoute,
  legalPrivacyRoute,
  legalSrdRoute,
]);

export const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
