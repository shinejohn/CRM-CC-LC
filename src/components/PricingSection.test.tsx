import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { PricingSection } from './PricingSection';

describe('PricingSection', () => {
  it('renders pricing section', () => {
    const { container } = render(<PricingSection />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
