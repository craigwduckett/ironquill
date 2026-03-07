import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    className,
    to,
  }: {
    children: React.ReactNode;
    className?: string;
    to: string;
    params?: Record<string, string>;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

// Stub CharacterCard to isolate DashboardPage logic
vi.mock('../CharacterCard/CharacterCard.js', () => ({
  CharacterCard: ({ character }: { character: { name: string } }) => (
    <div data-testid="character-card">{character.name}</div>
  ),
}));

const mockDashboardData = {
  data: undefined as
    | {
        characters: unknown[];
        adventures: unknown[];
        joinedAdventures: unknown[];
      }
    | undefined,
  isLoading: false,
  isError: false,
};

vi.mock('../hooks/useCharacters.js', () => ({
  useDashboard: () => mockDashboardData,
}));

vi.mock('../../srd/hooks/useSrd.js', () => ({
  useSrdSpecies: () => ({ data: [] }),
}));

const mockJoinAdventure = { mutateAsync: vi.fn() };
vi.mock('../../adventure/hooks/useAdventures.js', () => ({
  useJoinAdventure: () => mockJoinAdventure,
}));

vi.mock('../../../stores/auth.js', () => ({
  useAuthStore: (selector: (s: { user: { displayName: string } }) => unknown) =>
    selector({ user: { displayName: 'Aragorn Elessar' } }),
}));

import { DashboardPage } from './DashboardPage.js';

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <DashboardPage />
    </QueryClientProvider>,
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    mockDashboardData.data = undefined;
    mockDashboardData.isLoading = false;
    mockDashboardData.isError = false;
    mockJoinAdventure.mutateAsync = vi.fn().mockResolvedValue({});
  });

  it('greets the user by first name', () => {
    mockDashboardData.data = {
      characters: [],
      adventures: [],
      joinedAdventures: [],
    };
    renderPage();
    expect(screen.getByRole('heading', { name: /welcome back, aragorn/i })).toBeInTheDocument();
  });

  it('shows a spinner while loading', () => {
    mockDashboardData.isLoading = true;
    renderPage();
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('shows empty state when there are no characters', () => {
    mockDashboardData.data = {
      characters: [],
      adventures: [],
      joinedAdventures: [],
    };
    renderPage();
    expect(screen.getByText(/no characters yet/i)).toBeInTheDocument();
  });

  it('renders a character card for each character', () => {
    mockDashboardData.data = {
      characters: [
        {
          id: 'c1',
          name: 'Legolas',
          level: 5,
          hpCurrent: 32,
          hpMax: 40,
          ac: 15,
          portraitId: null,
          speciesId: null,
          classId: null,
        },
        {
          id: 'c2',
          name: 'Gimli',
          level: 3,
          hpCurrent: 20,
          hpMax: 30,
          ac: 16,
          portraitId: null,
          speciesId: null,
          classId: null,
        },
      ],
      adventures: [],
      joinedAdventures: [],
    };
    renderPage();
    expect(screen.getAllByTestId('character-card')).toHaveLength(2);
    expect(screen.getByText('Legolas')).toBeInTheDocument();
    expect(screen.getByText('Gimli')).toBeInTheDocument();
  });

  it('shows error state when the request fails', () => {
    mockDashboardData.isError = true;
    renderPage();
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it('shows stats bar after data loads', () => {
    mockDashboardData.data = {
      characters: [
        {
          id: 'c1',
          name: 'Legolas',
          level: 5,
          hpCurrent: 32,
          hpMax: 40,
          ac: 15,
          portraitId: null,
          speciesId: null,
          classId: null,
        },
      ],
      adventures: [],
      joinedAdventures: [],
    };
    renderPage();
    expect(screen.getByText('Characters')).toBeInTheDocument();
    expect(screen.getByText('Adventures')).toBeInTheDocument();
  });

  it('renders adventures listed for DM adventures', () => {
    mockDashboardData.data = {
      characters: [],
      adventures: [
        {
          id: 'adv1',
          title: 'Lost Mines',
          status: 'active',
          adventureType: 'campaign',
        },
      ],
      joinedAdventures: [],
    };
    renderPage();
    expect(screen.getByText('Lost Mines')).toBeInTheDocument();
  });

  it('has a join adventure form with an invite code input', () => {
    mockDashboardData.data = {
      characters: [],
      adventures: [],
      joinedAdventures: [],
    };
    renderPage();
    expect(screen.getByPlaceholderText(/enter invite code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument();
  });

  it('uppercases the invite code as it is typed', async () => {
    mockDashboardData.data = {
      characters: [],
      adventures: [],
      joinedAdventures: [],
    };
    renderPage();
    const input = screen.getByPlaceholderText(/enter invite code/i);
    await userEvent.type(input, 'abc123');
    expect(input).toHaveValue('ABC123');
  });

  it('shows an error when joining with an invalid code', async () => {
    mockJoinAdventure.mutateAsync = vi.fn().mockRejectedValue(new Error('Not found'));
    mockDashboardData.data = {
      characters: [],
      adventures: [],
      joinedAdventures: [],
    };
    renderPage();
    await userEvent.type(screen.getByPlaceholderText(/enter invite code/i), 'BADCODE');
    await userEvent.click(screen.getByRole('button', { name: /join/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid invite code/i)).toBeInTheDocument();
    });
  });

  it('does not submit the join form when the input is blank', async () => {
    mockDashboardData.data = {
      characters: [],
      adventures: [],
      joinedAdventures: [],
    };
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /join/i }));
    expect(mockJoinAdventure.mutateAsync).not.toHaveBeenCalled();
  });
});
