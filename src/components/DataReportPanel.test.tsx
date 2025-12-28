import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { DataReportPanel } from './DataReportPanel';

describe('DataReportPanel', () => {
  it('renders data report panel', () => {
    const { container } = render(<DataReportPanel />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays report metrics', () => {
    const { container } = render(<DataReportPanel />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders export button', () => {
    const { container } = render(<DataReportPanel />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
