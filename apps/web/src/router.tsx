import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { lazy } from 'react';
import { AppShell } from './components/layout/AppShell/AppShell.js';
import { AdventureNewPage } from './features/adventure/AdventureNewPage/index.js';
import { AdventureOverviewPage } from './features/adventure/AdventureOverviewPage/index.js';
import { AdventureSettingsPage } from './features/adventure/AdventureSettingsPage/index.js';
import { ScenesPage } from './features/adventure/ScenesPage/index.js';
import { LoginPage } from './features/auth/LoginPage/LoginPage.js';
import { RegisterPage } from './features/auth/RegisterPage/RegisterPage.js';
import { CharacterSheet } from './features/character/CharacterSheet/index.js';
import { CharacterWizard } from './features/character/CharacterWizard/index.js';
import { DashboardPage } from './features/character/DashboardPage/index.js';
import { LevelUpPage } from './features/character/LevelUpPage/index.js';
import { LandingPage } from './features/landing/LandingPage.js';
import { LegalPage } from './features/legal/LegalPage/index.js';
import { PrivacyPage } from './features/legal/PrivacyPage/index.js';
import { SrdAttributionsPage } from './features/legal/SrdAttributionsPage/index.js';
import { TermsPage } from './features/legal/TermsPage/index.js';
import { DmSessionPage } from './features/session/DmSessionPage/index.js';
import { PlayerSessionPage } from './features/session/PlayerSessionPage/index.js';
import { SessionLobbyPage } from './features/session/SessionLobbyPage/index.js';
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
  component: LandingPage,
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

const characterNewRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/characters/new',
  beforeLoad: requireAuth,
  component: CharacterWizard,
});

const characterDetailRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/characters/$id',
  beforeLoad: requireAuth,
  component: function CharacterSheetRoute() {
    const { id } = characterDetailRoute.useParams();
    return <CharacterSheet characterId={id} />;
  },
});

const characterLevelUpRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/characters/$id/levelup',
  beforeLoad: requireAuth,
  component: function LevelUpRoute() {
    const { id } = characterLevelUpRoute.useParams();
    return <LevelUpPage characterId={id} />;
  },
});

// ── Adventure routes ──────────────────────────────────────────────────────────

const adventureNewRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/adventures/new',
  beforeLoad: requireAuth,
  component: AdventureNewPage,
});

const adventureDetailRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/adventures/$id',
  beforeLoad: requireAuth,
  component: function AdventureDetailRoute() {
    const { id } = adventureDetailRoute.useParams();
    return <AdventureOverviewPage adventureId={id} />;
  },
});

const adventureScenesRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/adventures/$id/scenes',
  beforeLoad: requireAuth,
  component: function AdventureScenesRoute() {
    const { id } = adventureScenesRoute.useParams();
    return <ScenesPage adventureId={id} />;
  },
});

const adventureSettingsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/adventures/$id/settings',
  beforeLoad: requireAuth,
  component: function AdventureSettingsRoute() {
    const { id } = adventureSettingsRoute.useParams();
    return <AdventureSettingsPage adventureId={id} />;
  },
});

// ── Session routes ────────────────────────────────────────────────────────────

const adventureSessionsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/adventures/$id/sessions',
  beforeLoad: requireAuth,
  component: function AdventureSessionsRoute() {
    const { id } = adventureSessionsRoute.useParams();
    return <SessionLobbyPage adventureId={id} />;
  },
});

const dmSessionRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/sessions/$id/dm',
  beforeLoad: requireAuth,
  component: function DmSessionRoute() {
    const { id } = dmSessionRoute.useParams();
    return <DmSessionPage sessionId={id} />;
  },
});

const playerSessionRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/sessions/$id/play',
  beforeLoad: requireAuth,
  component: function PlayerSessionRoute() {
    const { id } = playerSessionRoute.useParams();
    // characterId passed via search param; default to empty string
    return <PlayerSessionPage sessionId={id} characterId="" />;
  },
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
    characterLevelUpRoute,
    adventureNewRoute,
    adventureDetailRoute,
    adventureScenesRoute,
    adventureSettingsRoute,
    adventureSessionsRoute,
    dmSessionRoute,
    playerSessionRoute,
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
