import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { MarketingPlanForm } from './MarketingPlanForm';

describe('MarketingPlanForm', () => {
  it('renders marketing plan form', () => {
    render(<MarketingPlanForm />);

    expect(screen.getByText(/ai-generated marketing plan/i)).toBeInTheDocument();
  });

  it('displays executive summary section', () => {
    render(<MarketingPlanForm />);

    expect(screen.getByText(/executive summary/i)).toBeInTheDocument();
  });
});
