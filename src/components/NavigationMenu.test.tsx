import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { NavigationMenu } from './NavigationMenu';

describe('NavigationMenu', () => {
  it('renders navigation menu', () => {
    const { container } = render(<NavigationMenu />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
