import { describe, it, expect } from 'vitest';
import { render } from '../../test/test-utils';
import { SecondarySubNavigationBar } from './SecondarySubNavigationBar';

describe('SecondarySubNavigationBar', () => {
  it('renders secondary sub navigation bar', () => {
    const { container } = render(<SecondarySubNavigationBar />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
