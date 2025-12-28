import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { FileExplorer } from './FileExplorer';

describe('FileExplorer', () => {
  it('renders file explorer', () => {
    const { container } = render(<FileExplorer />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
