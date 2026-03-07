import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock step sub-components so tests focus on wizard navigation logic,
// not on the full SRD data shapes each step needs.
vi.mock('./Step2Class.js', () => ({
  Step2Class: ({ onChange }: { draft: unknown; onChange: (p: { classId: string }) => void }) => (
    <div>
      <h2>Choose your Class</h2>
      <button type="button" onClick={() => onChange({ classId: 'fighter' })}>
        Fighter
      </button>
    </div>
  ),
}));

vi.mock('./Step3Background.js', () => ({
  Step3Background: () => (
    <div>
      <h2>Choose your Background</h2>
    </div>
  ),
}));

vi.mock('./Step4Abilities.js', () => ({
  Step4Abilities: () => (
    <div>
      <h2>Ability Scores</h2>
    </div>
  ),
}));

vi.mock('./Step5Review.js', () => ({
  Step5Review: ({
    onChange,
  }: {
    draft: unknown;
    onChange: (p: { name: string }) => void;
    species: unknown;
    srdClass: unknown;
    background: unknown;
  }) => (
    <div>
      <h2>Review</h2>
      <input
        aria-label="Character name"
        placeholder="Character name"
        onChange={(e) => onChange({ name: e.target.value })}
      />
    </div>
  ),
}));

vi.mock('./WizardPreview.js', () => ({
  WizardPreview: () => <aside aria-label="Character preview" />,
}));

const mockSpecies = [
  {
    id: 'elf',
    name: 'Elf',
    speed: 30,
    size: 'Medium',
    abilityBonuses: { dex: 2 },
    languages: ['Common', 'Elvish'],
    traits: [],
    description: '',
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    speed: 25,
    size: 'Medium',
    abilityBonuses: { con: 2 },
    languages: ['Common', 'Dwarvish'],
    traits: [],
    description: '',
  },
];

vi.mock('../../srd/hooks/useSrd.js', () => ({
  useSrdSpecies: () => ({ data: mockSpecies }),
  useSrdClasses: () => ({ data: [] }),
  useSrdBackgrounds: () => ({ data: [] }),
}));

const mockCreate = { mutateAsync: vi.fn(), isPending: false };
vi.mock('../hooks/useCharacters.js', () => ({
  useCreateCharacter: () => mockCreate,
}));

import { CharacterWizard } from './CharacterWizard.js';

function renderWizard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <CharacterWizard />
    </QueryClientProvider>,
  );
}

describe('CharacterWizard', () => {
  beforeEach(() => {
    mockCreate.mutateAsync = vi.fn().mockResolvedValue({ id: 'new-char-1' });
    mockCreate.isPending = false;
  });

  it('renders the wizard with step 1 active (Species)', () => {
    renderWizard();
    expect(screen.getByRole('heading', { name: /choose your species/i })).toBeInTheDocument();
  });

  it('renders step navigation with 5 steps', () => {
    renderWizard();
    expect(screen.getByRole('navigation', { name: /wizard steps/i })).toBeInTheDocument();
  });

  it('Next button is disabled on step 1 when no species is selected', () => {
    renderWizard();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('Back button is disabled on step 1', () => {
    renderWizard();
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
  });

  it('enables Next after selecting a species', async () => {
    renderWizard();
    await userEvent.click(screen.getByText('Elf'));
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
  });

  it('advances to step 2 (Class) after selecting species and clicking Next', async () => {
    renderWizard();
    await userEvent.click(screen.getByText('Elf'));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /choose your class/i })).toBeInTheDocument();
    });
  });

  it('can navigate back from step 2 to step 1', async () => {
    renderWizard();
    await userEvent.click(screen.getByText('Elf'));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.click(screen.getByRole('button', { name: /back/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /choose your species/i })).toBeInTheDocument();
    });
  });

  it('shows Create Character button on step 5', async () => {
    renderWizard();
    // Step 1: pick species
    await userEvent.click(screen.getByText('Elf'));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    // Step 2: pick class (mocked Fighter button)
    await userEvent.click(screen.getByRole('button', { name: /fighter/i }));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    // Step 3: background (optional, skip)
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    // Step 4: abilities
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    // Step 5
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create character/i })).toBeInTheDocument();
    });
  });

  it('Create Character button is disabled on step 5 until a name is entered', async () => {
    renderWizard();
    await userEvent.click(screen.getByText('Elf'));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.click(screen.getByRole('button', { name: /fighter/i }));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create character/i })).toBeDisabled();
    });
    await userEvent.type(screen.getByLabelText(/character name/i), 'Legolas');
    expect(screen.getByRole('button', { name: /create character/i })).not.toBeDisabled();
  });
});
