import { describe, it, expect } from 'vitest';
import { render } from '../../test/test-utils';
import { BrandBar } from './BrandBar';

describe('BrandBar', () => {
  it('renders brand bar', () => {
    const { container } = render(<BrandBar />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
