import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
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
    <a href={to ?? '/'} className={className}>
      {children}
    </a>
  ),
}));

const mockDelete = { mutate: vi.fn(), isPending: false };
vi.mock('../hooks/useCharacters.js', () => ({
  useDeleteCharacter: () => mockDelete,
}));

import type { CharacterSummary } from '../hooks/useCharacters.js';
import { CharacterCard } from './CharacterCard.js';

const baseCharacter: CharacterSummary = {
  id: 'char-1',
  name: 'Legolas',
  level: 5,
  hpCurrent: 32,
  hpMax: 40,
  ac: 15,
  portraitId: null,
  speciesId: 'elf',
  classId: 'ranger',
};

function renderCard(character: CharacterSummary = baseCharacter, speciesName?: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <CharacterCard character={character} speciesName={speciesName} />
    </QueryClientProvider>,
  );
}

describe('CharacterCard', () => {
  beforeEach(() => {
    mockDelete.mutate = vi.fn();
    mockDelete.isPending = false;
  });

  it('renders character name', () => {
    renderCard();
    expect(screen.getByText('Legolas')).toBeInTheDocument();
  });

  it('renders level badge', () => {
    renderCard();
    expect(screen.getByText('Lvl 5')).toBeInTheDocument();
  });

  it('renders species name when provided', () => {
    renderCard(baseCharacter, 'Elf');
    expect(screen.getByText('Elf')).toBeInTheDocument();
  });

  it('renders HP stats', () => {
    renderCard();
    expect(screen.getByText('32/40')).toBeInTheDocument();
  });

  it('renders AC stat', () => {
    renderCard();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders HP progress bar with correct aria attributes', () => {
    renderCard();
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '32');
    expect(bar).toHaveAttribute('aria-valuemax', '40');
  });

  it('does not render HP bar when hpMax is 0', () => {
    renderCard({ ...baseCharacter, hpMax: 0, hpCurrent: 0 });
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders default portrait emoji when no portraitId', () => {
    renderCard();
    expect(screen.getByText('⚔️')).toBeInTheDocument();
  });

  it('renders portrait image when portraitId is set', () => {
    const { container } = renderCard({
      ...baseCharacter,
      portraitId: 'https://example.com/portrait.jpg',
    });
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://example.com/portrait.jpg');
    expect(img).toHaveAttribute('alt', 'Legolas');
  });

  it('shows delete confirmation overlay when delete button is clicked', async () => {
    renderCard();
    await userEvent.click(screen.getByRole('button', { name: /delete legolas/i }));
    expect(screen.getByText(/permanently delete/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('hides confirmation overlay on cancel', async () => {
    renderCard();
    await userEvent.click(screen.getByRole('button', { name: /delete legolas/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByText(/permanently delete/i)).not.toBeInTheDocument();
  });

  it('calls deleteCharacter.mutate when delete is confirmed', async () => {
    renderCard();
    await userEvent.click(screen.getByRole('button', { name: /delete legolas/i }));
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(mockDelete.mutate).toHaveBeenCalledWith('char-1', expect.any(Object));
  });

  it('shows view sheet link', () => {
    renderCard();
    expect(screen.getByRole('link', { name: /view sheet/i })).toBeInTheDocument();
  });
});

describe('CharacterCard HP bar variants', () => {
  it('renders full variant when hp > 50%', () => {
    renderCard({ ...baseCharacter, hpCurrent: 30, hpMax: 40 });
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
  });

  it('renders with 100% bar when max is 0', () => {
    renderCard({ ...baseCharacter, hpCurrent: 0, hpMax: 0 });
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders low hp variant when hp <= 25%', async () => {
    renderCard({ ...baseCharacter, hpCurrent: 5, hpMax: 40 });
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '5');
  });
});
