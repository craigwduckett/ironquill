import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import { lazy, type ReactNode, useEffect } from 'react';
import { AppShell } from './components/layout/AppShell/AppShell.js';
import { AdventureNewPage } from './features/adventure/AdventureNewPage/index.js';
import { AdventureOverviewPage } from './features/adventure/AdventureOverviewPage/index.js';
import { AdventureSettingsPage } from './features/adventure/AdventureSettingsPage/index.js';
import { KidsPresetsPage } from './features/adventure/KidsPresetsPage/index.js';
import { NPCRosterPage } from './features/adventure/NPCRosterPage/index.js';
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
import { SrdFeatsPage } from './features/srd/SrdFeatsPage/index.js';
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

// ── Auth guard ────────────────────────────────────────────────────────────────
// beforeLoad runs synchronously. On a hard refresh, accessToken is null and
// isRestoring is true (GET /auth/me hasn't resolved yet). We only redirect
// when we *know* there is no session (isRestoring=false, accessToken=null).
// While restoring, we let navigation proceed — AuthGuard renders null until
// the check settles, then either shows the page or throws a redirect.

function requireAuth() {
  const { accessToken, isRestoring } = useAuthStore.getState();
  if (!isRestoring && !accessToken) throw redirect({ to: '/login' });
}

// Component-level guard. Renders nothing during session restore, then either
// shows children (authenticated) or navigates to /login (not authenticated).
// useNavigate is used instead of throw redirect() — throwing inside a component
// render causes React to treat it as an unhandled error, not a navigation.
function AuthGuard({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isRestoring = useAuthStore((s) => s.isRestoring);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isRestoring && !accessToken) {
      void navigate({ to: '/login', replace: true });
    }
  }, [isRestoring, accessToken, navigate]);

  if (isRestoring) return null;
  if (!accessToken) return null;
  return <>{children}</>;
}

// ── Protected layout route ────────────────────────────────────────────────────
// All routes that require authentication nest under this. The combination of
// beforeLoad (fast-path redirect when auth is confirmed absent) and AuthGuard
// (handles the async restore window) prevents any flash to /login on refresh.

const protectedRoute = createRoute({
  getParentRoute: () => shellRoute,
  id: 'protected',
  beforeLoad: requireAuth,
  component: () => (
    <AuthGuard>
      <Outlet />
    </AuthGuard>
  ),
});

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

// ── Protected routes (all nested under protectedRoute) ────────────────────────

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const characterNewRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/characters/new',
  component: CharacterWizard,
});

const characterDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/characters/$id',
  component: function CharacterSheetRoute() {
    const { id } = characterDetailRoute.useParams();
    return <CharacterSheet characterId={id} />;
  },
});

const characterLevelUpRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/characters/$id/levelup',
  component: function LevelUpRoute() {
    const { id } = characterLevelUpRoute.useParams();
    return <LevelUpPage characterId={id} />;
  },
});

// ── Adventure routes ──────────────────────────────────────────────────────────

const adventureNewRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/adventures/new',
  component: AdventureNewPage,
});

const adventureDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/adventures/$id',
  component: function AdventureDetailRoute() {
    const { id } = adventureDetailRoute.useParams();
    return <AdventureOverviewPage adventureId={id} />;
  },
});

const adventureScenesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/adventures/$id/scenes',
  component: function AdventureScenesRoute() {
    const { id } = adventureScenesRoute.useParams();
    return <ScenesPage adventureId={id} />;
  },
});

const adventureSettingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/adventures/$id/settings',
  component: function AdventureSettingsRoute() {
    const { id } = adventureSettingsRoute.useParams();
    return <AdventureSettingsPage adventureId={id} />;
  },
});

const adventureNpcsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/adventures/$id/npcs',
  component: function AdventureNpcsRoute() {
    const { id } = adventureNpcsRoute.useParams();
    return <NPCRosterPage adventureId={id} />;
  },
});

const adventurePresetsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/adventures/$id/presets',
  component: function AdventurePresetsRoute() {
    const { id } = adventurePresetsRoute.useParams();
    return <KidsPresetsPage adventureId={id} />;
  },
});

// ── Session routes ────────────────────────────────────────────────────────────

const adventureSessionsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/adventures/$id/sessions',
  component: function AdventureSessionsRoute() {
    const { id } = adventureSessionsRoute.useParams();
    return <SessionLobbyPage adventureId={id} />;
  },
});

const dmSessionRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/sessions/$id/dm',
  component: function DmSessionRoute() {
    const { id } = dmSessionRoute.useParams();
    return <DmSessionPage sessionId={id} />;
  },
});

const playerSessionRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/sessions/$id/play',
  component: function PlayerSessionRoute() {
    const { id } = playerSessionRoute.useParams();
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

const srdFeatsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/srd/feats',
  component: SrdFeatsPage,
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
    protectedRoute.addChildren([
      dashboardRoute,
      characterNewRoute,
      characterDetailRoute,
      characterLevelUpRoute,
      adventureNewRoute,
      adventureDetailRoute,
      adventureScenesRoute,
      adventureSettingsRoute,
      adventureNpcsRoute,
      adventurePresetsRoute,
      adventureSessionsRoute,
      dmSessionRoute,
      playerSessionRoute,
    ]),
    srdRoute,
    srdSpeciesRoute,
    srdClassesRoute,
    srdBackgroundsRoute,
    srdSpellsRoute,
    srdMonstersRoute,
    srdItemsRoute,
    srdConditionsRoute,
    srdRulesRoute,
    srdFeatsRoute,
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
