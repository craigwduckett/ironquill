import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge.js';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Lvl 5</Badge>);
    expect(screen.getByText('Lvl 5')).toBeInTheDocument();
  });

  it('renders as a span', () => {
    render(<Badge>Elf</Badge>);
    expect(screen.getByText('Elf').tagName).toBe('SPAN');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-cls">Tag</Badge>);
    expect(screen.getByText('Tag')).toHaveClass('custom-cls');
  });

  it.each([
    'default',
    'accent',
    'success',
    'warning',
    'danger',
    'info',
  ] as const)('renders variant %s', (variant) => {
    render(<Badge variant={variant}>text</Badge>);
    expect(screen.getByText('text')).toBeInTheDocument();
  });
});
