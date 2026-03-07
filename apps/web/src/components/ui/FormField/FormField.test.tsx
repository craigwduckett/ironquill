import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField } from './FormField.js';

describe('FormField (input)', () => {
  it('renders a label and input with matching id', () => {
    render(<FormField id="email" label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('shows required asterisk when required', () => {
    render(<FormField id="name" label="Name" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows error message with role=alert', () => {
    render(<FormField id="email" label="Email" error="Invalid email" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Invalid email');
  });

  it('sets aria-invalid when error is present', () => {
    render(<FormField id="email" label="Email" error="Required" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows hint text when no error', () => {
    render(<FormField id="pw" label="Password" hint="Min 8 chars" />);
    expect(screen.getByText('Min 8 chars')).toBeInTheDocument();
  });

  it('hides hint when error is present', () => {
    render(<FormField id="pw" label="Password" error="Too short" hint="Min 8 chars" />);
    expect(screen.queryByText('Min 8 chars')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Too short');
  });

  it('links input to error via aria-describedby', () => {
    render(<FormField id="email" label="Email" error="Bad email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-describedby', 'email-error');
  });

  it('links input to hint via aria-describedby when no error', () => {
    render(<FormField id="pw" label="Password" hint="Min 8 chars" />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-describedby', 'pw-hint');
  });
});

describe('FormField (textarea)', () => {
  it('renders a textarea when as="textarea"', () => {
    render(<FormField id="notes" label="Notes" as="textarea" />);
    const el = screen.getByLabelText('Notes');
    expect(el.tagName).toBe('TEXTAREA');
  });

  it('shows error on textarea', () => {
    render(<FormField id="notes" label="Notes" as="textarea" error="Too long" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Too long');
  });
});
