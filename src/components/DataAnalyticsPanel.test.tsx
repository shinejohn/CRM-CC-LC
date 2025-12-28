import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { DataAnalyticsPanel } from './DataAnalyticsPanel';

describe('DataAnalyticsPanel', () => {
  it('renders data analytics panel', () => {
    const { container } = render(<DataAnalyticsPanel />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
