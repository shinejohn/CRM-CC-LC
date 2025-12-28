import { describe, it, expect, vi } from 'vitest';
import { render } from '../../../test/test-utils';
import { FAQCategoryManager } from './FAQCategoryManager';

vi.mock('@/services/learning/knowledge-api', () => ({
  knowledgeApi: {
    getCategories: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

describe('FAQCategoryManager', () => {
  it('renders FAQ category manager', () => {
    const { container } = render(<FAQCategoryManager onClose={() => {}} />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
