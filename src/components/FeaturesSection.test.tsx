import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { FeaturesSection } from './FeaturesSection';

describe('FeaturesSection', () => {
  it('renders features section', () => {
    const { container } = render(<FeaturesSection />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
