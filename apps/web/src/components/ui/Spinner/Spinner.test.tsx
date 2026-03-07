import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from './Spinner.js';

describe('Spinner', () => {
  it('renders with default label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status', { hidden: true })).toHaveAttribute('aria-label', 'Loading…');
  });

  it('renders with custom label', () => {
    render(<Spinner label="Saving…" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveAttribute('aria-label', 'Saving…');
  });

  it('applies custom className', () => {
    render(<Spinner className="my-spinner" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('my-spinner');
  });

  it.each(['sm', 'md', 'lg'] as const)('renders size %s', (size) => {
    render(<Spinner size={size} />);
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });
});
