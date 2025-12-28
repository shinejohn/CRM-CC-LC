import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { UseCasesSection } from './UseCasesSection';

describe('UseCasesSection', () => {
  it('renders use cases section', () => {
    const { container } = render(<UseCasesSection />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
