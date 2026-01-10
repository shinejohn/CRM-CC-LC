import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { SearchHeader } from './SearchHeader';

vi.mock('@/services/learning/knowledge-api', () => ({
  knowledgeApi: {
    semanticSearch: vi.fn().mockResolvedValue([]),
  },
}));

describe('SearchHeader', () => {
  it('renders search header', () => {
    render(<SearchHeader />);

    const searchInput = screen.getByPlaceholderText(/search knowledge base/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('displays search input field', () => {
    render(<SearchHeader />);

    // Input has role="searchbox", not "textbox"
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });
});
