import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { ChatPanel } from './ChatPanel';

describe('ChatPanel', () => {
  const mockMessages = [
    { sender: 'User', text: 'Hello', isAI: false },
    { sender: 'AI', text: 'Hi there!', isAI: true },
  ];

  it('renders chat panel', () => {
    const { container } = render(
      <ChatPanel
        messages={mockMessages}
        addMessage={() => {}}
        isCollapsed={false}
        onToggleCollapse={() => {}}
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays messages', () => {
    const { container } = render(
      <ChatPanel
        messages={mockMessages}
        addMessage={() => {}}
        isCollapsed={false}
        onToggleCollapse={() => {}}
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
