import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders footer component', () => {
    const { container } = render(<Footer />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
