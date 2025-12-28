import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { AIWorkflowPanel } from './AIWorkflowPanel';

describe('AIWorkflowPanel', () => {
  it('renders AI workflow panel', () => {
    const { container } = render(<AIWorkflowPanel />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
