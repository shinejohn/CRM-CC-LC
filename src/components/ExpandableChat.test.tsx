import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { ExpandableChat } from './ExpandableChat';

describe('ExpandableChat', () => {
  it('renders expandable chat', () => {
    const { container } = render(<ExpandableChat />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
