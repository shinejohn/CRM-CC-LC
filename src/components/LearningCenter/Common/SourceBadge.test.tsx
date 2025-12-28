import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { SourceBadge } from './SourceBadge';

describe('SourceBadge', () => {
  it('renders source badge for owner', () => {
    render(<SourceBadge source="owner" />);
    expect(screen.getByText(/owner/i)).toBeInTheDocument();
  });

  it('renders source badge for google', () => {
    render(<SourceBadge source="google" />);
    expect(screen.getByText(/google/i)).toBeInTheDocument();
  });

  it('renders source badge with custom size', () => {
    const { container } = render(<SourceBadge source="owner" size="sm" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
