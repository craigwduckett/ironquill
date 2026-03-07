import {
  createRootRoute,
  createRoute,
  createRouter,
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

// ── Root (shell layout) ───────────────────────────────────────────────────────

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

// ── Auth guard helper ─────────────────────────────────────────────────────────

function requireAuth() {
  const { accessToken } = useAuthStore.getState();
  if (!accessToken) throw redirect({ to: '/login' });
}

// ── Public routes ─────────────────────────────────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
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
        <a
          href="/register"
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
        </a>
        <a
          href="/srd"
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
        </a>
      </div>
    </main>
  ),
});

// ── Auth routes ───────────────────────────────────────────────────────────────

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

// ── Protected routes ──────────────────────────────────────────────────────────

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: requireAuth,
  component: DashboardPage,
});

// Character routes — wizard and sheet will be built in the next phase.
// Stubs exist so links in the dashboard compile and navigate correctly.
const characterNewRoute = createRoute({
  getParentRoute: () => rootRoute,
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
  getParentRoute: () => rootRoute,
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
  getParentRoute: () => rootRoute,
  path: '/srd',
  component: SrdIndexPage,
});

const srdSpeciesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/srd/species',
  component: SrdSpeciesPage,
});

const srdClassesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/srd/classes',
  component: SrdClassesPage,
});

const srdBackgroundsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/srd/backgrounds',
  component: SrdBackgroundsPage,
});

const srdSpellsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/srd/spells',
  component: SrdSpellsPage,
});

const srdMonstersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/srd/monsters',
  component: SrdMonstersPage,
});

const srdItemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/srd/items',
  component: SrdItemsPage,
});

const srdConditionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/srd/conditions',
  component: SrdConditionsPage,
});

const srdRulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/srd/rules',
  component: SrdRulesPage,
});

// ── Legal routes ──────────────────────────────────────────────────────────────

const legalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/legal',
  component: LegalPage,
});

const legalTermsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/legal/terms',
  component: TermsPage,
});

const legalPrivacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/legal/privacy',
  component: PrivacyPage,
});

const legalSrdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/legal/srd',
  component: SrdAttributionsPage,
});

// ── Router ────────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
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
]);

export const router = createRouter({ routeTree, defaultPreload: 'intent' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
