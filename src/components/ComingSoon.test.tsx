import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { ComingSoon } from './ComingSoon';

describe('ComingSoon', () => {
  it('renders with title', () => {
    render(<ComingSoon title="Test Feature" />);
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
  });

  it('renders with description when provided', () => {
    render(<ComingSoon title="Test Feature" description="Coming soon description" />);
    expect(screen.getByText('Coming soon description')).toBeInTheDocument();
  });

  it('renders default message', () => {
    render(<ComingSoon title="Test Feature" />);
    expect(screen.getByText(/This feature is coming soon!/)).toBeInTheDocument();
  });

  it('has a back button', () => {
    render(<ComingSoon title="Test Feature" />);
    const backButton = screen.getByRole('link', { name: /go back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('uses custom back path when provided', () => {
    render(<ComingSoon title="Test Feature" backPath="/custom" />);
    const backButton = screen.getByRole('link', { name: /go back/i });
    expect(backButton).toHaveAttribute('href', '/custom');
  });

  it('uses default back path when not provided', () => {
    render(<ComingSoon title="Test Feature" />);
    const backButton = screen.getByRole('link', { name: /go back/i });
    expect(backButton).toHaveAttribute('href', '/');
  });
});
