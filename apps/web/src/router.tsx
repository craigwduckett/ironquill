import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { lazy } from 'react';
import { AppShell } from './components/layout/AppShell/AppShell.js';
import { LoginPage } from './features/auth/LoginPage/LoginPage.js';
import { RegisterPage } from './features/auth/RegisterPage/RegisterPage.js';
import { DashboardPage } from './features/character/DashboardPage/index.js';
import { LegalPage } from './features/legal/LegalPage/index.js';
import { PrivacyPage } from './features/legal/PrivacyPage/index.js';
import { SrdAttributionsPage } from './features/legal/SrdAttributionsPage/index.js';
import { TermsPage } from './features/legal/TermsPage/index.js';
import { SrdBackgroundsPage } from './features/srd/SrdBackgroundsPage/SrdBackgroundsPage.js';
import { SrdClassesPage } from './features/srd/SrdClassesPage/SrdClassesPage.js';
import { SrdConditionsPage } from './features/srd/SrdConditionsPage/SrdConditionsPage.js';
import { SrdIndexPage } from './features/srd/SrdIndexPage/SrdIndexPage.js';
import { SrdItemsPage } from './features/srd/SrdItemsPage/SrdItemsPage.js';
import { SrdMonstersPage } from './features/srd/SrdMonstersPage/SrdMonstersPage.js';
import { SrdRulesPage } from './features/srd/SrdRulesPage/SrdRulesPage.js';
import { SrdSpeciesPage } from './features/srd/SrdSpeciesPage/SrdSpeciesPage.js';
import { SrdSpellsPage } from './features/srd/SrdSpellsPage/SrdSpellsPage.js';
import { useAuthStore } from './stores/auth.js';

// ── Dev tools ─────────────────────────────────────────────────────────────────

const RouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/router-devtools').then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    )
  : ((() => null) as () => null);

// ── Root (bare) ───────────────────────────────────────────────────────────────
// Auth routes use this root directly so they render their own full-screen
// layout without the AppShell header/footer.

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <RouterDevtools />
    </>
  ),
});

// ── Shell layout route ────────────────────────────────────────────────────────
// All non-auth pages nest under this to get the persistent header/footer.

const shellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'shell',
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

// ── Auth guard helper ─────────────────────────────────────────────────────────

function requireAuth() {
  const { accessToken } = useAuthStore.getState();
  if (!accessToken) throw redirect({ to: '/login' });
}

// ── Home route ────────────────────────────────────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/',
  component: () => (
    <main
      style={{
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
        padding: 'var(--space-20) var(--space-6)',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-4xl)',
          color: 'var(--color-accent)',
          marginBottom: 'var(--space-4)',
        }}
      >
        IronQuill
      </h1>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-lg)',
          marginBottom: 'var(--space-8)',
        }}
      >
        Your D&amp;D adventure companion. Run better sessions, build richer worlds.
      </p>
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-4)',
          justifyContent: 'center',
        }}
      >
        <Link
          to="/register"
          style={{
            padding: 'var(--space-3) var(--space-8)',
            background: 'var(--color-accent)',
            color: 'var(--color-text-inverse)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 'var(--font-semibold)',
          }}
        >
          Get started
        </Link>
        <Link
          to="/srd"
          style={{
            padding: 'var(--space-3) var(--space-8)',
            background: 'var(--color-surface-raised)',
            color: 'var(--color-text-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            textDecoration: 'none',
          }}
        >
          Browse SRD
        </Link>
      </div>
    </main>
  ),
});

// ── Auth routes (no AppShell — full-screen layout) ────────────────────────────

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

// ── Protected routes (all nested under shellRoute) ────────────────────────────

const dashboardRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/dashboard',
  beforeLoad: requireAuth,
  component: DashboardPage,
});

// Character routes — wizard and sheet will be built in the next phase.
// Stubs exist so links in the dashboard compile and navigate correctly.
const characterNewRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/characters/new',
  beforeLoad: requireAuth,
  component: () => (
    <div
      style={{
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-6)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          color: 'var(--color-accent)',
          marginBottom: 'var(--space-4)',
        }}
      >
        Create Character
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Character creation wizard — coming next.
      </p>
    </div>
  ),
});

const characterDetailRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/characters/$id',
  beforeLoad: requireAuth,
  component: () => (
    <div
      style={{
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-6)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          color: 'var(--color-accent)',
          marginBottom: 'var(--space-4)',
        }}
      >
        Character Sheet
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>Character sheet — coming next.</p>
    </div>
  ),
});

// ── SRD routes ────────────────────────────────────────────────────────────────

const srdRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/srd',
  component: SrdIndexPage,
});

const srdSpeciesRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/srd/species',
  component: SrdSpeciesPage,
});

const srdClassesRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/srd/classes',
  component: SrdClassesPage,
});

const srdBackgroundsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/srd/backgrounds',
  component: SrdBackgroundsPage,
});

const srdSpellsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/srd/spells',
  component: SrdSpellsPage,
});

const srdMonstersRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/srd/monsters',
  component: SrdMonstersPage,
});

const srdItemsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/srd/items',
  component: SrdItemsPage,
});

const srdConditionsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/srd/conditions',
  component: SrdConditionsPage,
});

const srdRulesRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/srd/rules',
  component: SrdRulesPage,
});

// ── Legal routes ──────────────────────────────────────────────────────────────

const legalRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/legal',
  component: LegalPage,
});

const legalTermsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/legal/terms',
  component: TermsPage,
});

const legalPrivacyRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/legal/privacy',
  component: PrivacyPage,
});

const legalSrdRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/legal/srd',
  component: SrdAttributionsPage,
});

// ── Router ────────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  shellRoute.addChildren([
    indexRoute,
    dashboardRoute,
    characterNewRoute,
    characterDetailRoute,
    srdRoute,
    srdSpeciesRoute,
    srdClassesRoute,
    srdBackgroundsRoute,
    srdSpellsRoute,
    srdMonstersRoute,
    srdItemsRoute,
    srdConditionsRoute,
    srdRulesRoute,
    legalRoute,
    legalTermsRoute,
    legalPrivacyRoute,
    legalSrdRoute,
  ]),
]);

export const router = createRouter({ routeTree, defaultPreload: 'intent' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
