import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders page header', () => {
    const { container } = render(<PageHeader title="Test Title" />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
