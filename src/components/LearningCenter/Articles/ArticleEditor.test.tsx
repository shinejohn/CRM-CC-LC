import { describe, it, expect, vi } from 'vitest';
import { render } from '../../../test/test-utils';
import { ArticleEditor } from './ArticleEditor';

vi.mock('@/services/learning/knowledge-api', () => ({
  knowledgeApi: {
    getKnowledge: vi.fn(),
    createKnowledge: vi.fn(),
    updateKnowledge: vi.fn(),
    generateEmbedding: vi.fn(),
  },
}));

vi.mock('../Common/SourceBadge', () => ({
  SourceBadge: () => <div data-testid="source-badge">Source</div>,
}));

vi.mock('../Common/AgentAccessSelector', () => ({
  AgentAccessSelector: () => <div data-testid="agent-selector">Agent</div>,
}));

describe('ArticleEditor', () => {
  it('renders article editor', () => {
    const { container } = render(<ArticleEditor onClose={() => {}} onSave={() => {}} />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
