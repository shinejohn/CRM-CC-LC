import { describe, it, expect, vi } from 'vitest';
import { render } from '../../../test/test-utils';
import { EmbeddingStatus } from './EmbeddingStatus';

vi.mock('@/services/learning/knowledge-api', () => ({
  knowledgeApi: {
    getEmbeddingStatus: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

describe('EmbeddingStatus', () => {
  it('renders embedding status', () => {
    const { container } = render(<EmbeddingStatus />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
