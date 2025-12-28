import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { TestimonialsSection } from './TestimonialsSection';

describe('TestimonialsSection', () => {
  it('renders testimonials section', () => {
    const { container } = render(<TestimonialsSection />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
