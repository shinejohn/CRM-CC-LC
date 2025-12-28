import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { UsageStats } from './UsageStats';

describe('UsageStats', () => {
  it('renders usage statistics component', () => {
    render(<UsageStats views={100} helpfulCount={80} notHelpfulCount={20} />);

    // Component renders statistics
    expect(screen.getByText(/100/i)).toBeInTheDocument();
  });

  it('displays helpful count', () => {
    render(<UsageStats views={100} helpfulCount={80} notHelpfulCount={20} />);

    expect(screen.getByText(/80/i)).toBeInTheDocument();
  });

  it('can be expanded to show not helpful count', async () => {
    const user = userEvent.setup();
    render(<UsageStats views={100} helpfulCount={80} notHelpfulCount={20} />);

    // Component renders
    expect(screen.getByText(/100/i)).toBeInTheDocument();
    
    // Click to expand (notHelpfulCount is only shown when expanded)
    const button = screen.getByRole('button');
    await user.click(button);

    // Now the not helpful count should be visible
    expect(screen.getByText(/not helpful/i)).toBeInTheDocument();
  });

  it('handles zero counts', () => {
    const { container } = render(<UsageStats views={0} helpfulCount={0} notHelpfulCount={0} />);

    // Component should render even with zero counts
    expect(container.firstChild).toBeInTheDocument();
  });
});
