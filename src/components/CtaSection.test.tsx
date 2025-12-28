import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { CtaSection } from './CtaSection';

describe('CtaSection', () => {
  it('renders CTA section', () => {
    const { container } = render(<CtaSection />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
