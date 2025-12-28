import { describe, it, expect, vi } from 'vitest';
import { render } from '../../../test/test-utils';
import { FAQBulkImport } from './FAQBulkImport';

describe('FAQBulkImport', () => {
  it('renders FAQ bulk import', () => {
    const { container } = render(<FAQBulkImport onClose={() => {}} onComplete={() => {}} />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
