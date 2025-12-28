import { describe, it, expect } from 'vitest';
import { render } from '../../test/test-utils';
import { MainNavigation } from './MainNavigation';

describe('MainNavigation', () => {
  it('renders main navigation', () => {
    const { container } = render(<MainNavigation />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
