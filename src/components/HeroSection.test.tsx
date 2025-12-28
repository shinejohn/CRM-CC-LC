import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('renders hero section', () => {
    const { container } = render(<HeroSection />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
