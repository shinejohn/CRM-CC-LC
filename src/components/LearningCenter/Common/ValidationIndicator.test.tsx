import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { ValidationIndicator } from './ValidationIndicator';

describe('ValidationIndicator', () => {
  it('renders verified status', () => {
    render(<ValidationIndicator status="verified" />);

    expect(screen.getByText(/verified/i)).toBeInTheDocument();
  });

  it('renders unverified status', () => {
    render(<ValidationIndicator status="unverified" />);

    expect(screen.getByText(/unverified/i)).toBeInTheDocument();
  });

  it('renders disputed status', () => {
    render(<ValidationIndicator status="disputed" />);

    expect(screen.getByText(/disputed/i)).toBeInTheDocument();
  });

  it('renders outdated status', () => {
    render(<ValidationIndicator status="outdated" />);

    expect(screen.getByText(/outdated/i)).toBeInTheDocument();
  });
});
