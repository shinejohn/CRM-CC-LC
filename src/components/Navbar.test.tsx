import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('renders navbar', () => {
    const { container } = render(<Navbar />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
