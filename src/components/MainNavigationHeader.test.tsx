import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { MainNavigationHeader } from './MainNavigationHeader';

describe('MainNavigationHeader', () => {
  it('renders main navigation header', () => {
    const { container } = render(<MainNavigationHeader />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
