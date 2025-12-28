import { describe, it, expect, vi } from 'vitest';
import { render } from '../../../test/test-utils';
import { AIChatPanel } from './AIChatPanel';

vi.mock('@/services/learning/ai-api', () => ({
  aiApi: {
    sendMessage: vi.fn(),
  },
}));

describe('AIChatPanel', () => {
  it('renders AI chat panel when open', () => {
    const { container } = render(
      <AIChatPanel
        isOpen={true}
        onClose={() => {}}
        customerId="test-123"
        presentationId="test-456"
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
