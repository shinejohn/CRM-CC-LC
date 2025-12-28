import { describe, it, expect } from 'vitest';
import { render } from '../../test/test-utils';
import { SubNavigationBar } from './SubNavigationBar';

describe('SubNavigationBar', () => {
  it('renders sub navigation bar', () => {
    const { container } = render(<SubNavigationBar />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
