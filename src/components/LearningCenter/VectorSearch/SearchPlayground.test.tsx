import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { SearchPlayground } from './SearchPlayground';

vi.mock('@/services/learning/knowledge-api', () => ({
  knowledgeApi: {
    search: vi.fn().mockResolvedValue([]),
  },
}));

describe('SearchPlayground', () => {
  it('renders search playground', () => {
    render(<SearchPlayground />);

    expect(screen.getByText(/search playground/i)).toBeInTheDocument();
  });
});
