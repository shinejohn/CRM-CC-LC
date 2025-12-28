import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { PresentationPanel } from './PresentationPanel';

describe('PresentationPanel', () => {
  it('renders presentation panel', () => {
    const { container } = render(<PresentationPanel />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
