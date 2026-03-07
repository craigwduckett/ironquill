import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState.js';

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders optional description', () => {
    render(<EmptyState title="No items" description="Create one to get started." />);
    expect(screen.getByText('Create one to get started.')).toBeInTheDocument();
  });

  it('renders optional icon', () => {
    render(<EmptyState title="Empty" icon="⚔️" />);
    expect(screen.getByText('⚔️')).toBeInTheDocument();
  });

  it('does not render icon when omitted', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByText('⚔️')).not.toBeInTheDocument();
  });

  it('renders optional action', () => {
    render(<EmptyState title="Empty" action={<button type="button">Create</button>} />);
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    const { container } = render(<EmptyState title="Empty" />);
    const paras = container.querySelectorAll('p');
    expect(paras).toHaveLength(1);
  });
});
