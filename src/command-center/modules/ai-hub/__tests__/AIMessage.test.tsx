import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { AIMessage } from '../AIMessage';
import { AIMessage as AIMessageType } from '@/types/command-center';

// Mock ReactMarkdown
vi.mock('react-markdown', () => ({
  default: ({ children }: any) => <div data-testid="markdown">{children}</div>,
}));

describe('AIMessage', () => {
  const mockUserMessage: AIMessageType = {
    id: '1',
    role: 'user',
    content: 'Hello, how are you?',
    timestamp: new Date().toISOString(),
  };

  const mockAssistantMessage: AIMessageType = {
    id: '2',
    role: 'assistant',
    content: 'I am doing well, thank you!',
    timestamp: new Date().toISOString(),
  };

  const mockMessageWithCitations: AIMessageType = {
    id: '3',
    role: 'assistant',
    content: 'Here is some information.',
    timestamp: new Date().toISOString(),
    metadata: {
      citations: [
        {
          source: 'Document 1',
          url: 'https://example.com/doc1',
          excerpt: 'Relevant excerpt',
        },
        {
          source: 'Document 2',
          url: 'https://example.com/doc2',
          excerpt: 'Another excerpt',
        },
      ],
    },
  };

  const mockMessageWithToolCalls: AIMessageType = {
    id: '4',
    role: 'assistant',
    content: 'Processing your request...',
    timestamp: new Date().toISOString(),
    metadata: {
      toolCalls: [
        {
          id: 'tc-1',
          name: 'search',
          arguments: { query: 'test' },
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user message correctly', () => {
    render(<AIMessage message={mockUserMessage} />);

    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
  });

  it('renders assistant message correctly', () => {
    render(<AIMessage message={mockAssistantMessage} />);

    expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();
  });

  it('displays citations when present', () => {
    render(<AIMessage message={mockMessageWithCitations} />);

    expect(screen.getByText(/2 source/i)).toBeInTheDocument();
  });

  it('expands citations when clicked', async () => {
    const user = userEvent.setup();
    render(<AIMessage message={mockMessageWithCitations} />);

    const citationsButton = screen.getByText(/2 source/i);
    await user.click(citationsButton);

    await waitFor(() => {
      expect(screen.getByText('Document 1')).toBeInTheDocument();
      expect(screen.getByText('Document 2')).toBeInTheDocument();
    });
  });

  it('collapses citations when clicked again', async () => {
    const user = userEvent.setup();
    render(<AIMessage message={mockMessageWithCitations} />);

    const citationsButton = screen.getByText(/2 source/i);
    await user.click(citationsButton);

    await waitFor(() => {
      expect(screen.getByText('Document 1')).toBeInTheDocument();
    });

    await user.click(citationsButton);

    await waitFor(() => {
      expect(screen.queryByText('Document 1')).not.toBeInTheDocument();
    });
  });

  it('shows checkmark after copying', async () => {
    const user = userEvent.setup();
    render(<AIMessage message={mockAssistantMessage} />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
    });
  });

  it('handles feedback thumbs up', async () => {
    const user = userEvent.setup();
    render(<AIMessage message={mockAssistantMessage} />);

    const thumbsUpButton = screen.getByRole('button', { name: /thumbs up/i });
    await user.click(thumbsUpButton);

    // Button should be highlighted
    expect(thumbsUpButton).toHaveClass(/green|text-green/);
  });

  it('handles feedback thumbs down', async () => {
    const user = userEvent.setup();
    render(<AIMessage message={mockAssistantMessage} />);

    const thumbsDownButton = screen.getByRole('button', { name: /thumbs down/i });
    await user.click(thumbsDownButton);

    // Button should be highlighted
    expect(thumbsDownButton).toHaveClass(/red|text-red/);
  });

  it('calls onRegenerate when regenerate button is clicked', async () => {
    const mockRegenerate = vi.fn();
    const user = userEvent.setup();
    render(<AIMessage message={mockAssistantMessage} isLast={true} onRegenerate={mockRegenerate} />);

    const regenerateButton = screen.getByRole('button', { name: /regenerate|refresh/i });
    await user.click(regenerateButton);

    expect(mockRegenerate).toHaveBeenCalled();
  });

  it('only shows actions for assistant messages', () => {
    render(<AIMessage message={mockUserMessage} />);

    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument();
  });

  it('renders markdown content correctly', () => {
    const markdownMessage: AIMessageType = {
      id: '5',
      role: 'assistant',
      content: '# Heading\n\n**Bold text**',
      timestamp: new Date().toISOString(),
    };

    render(<AIMessage message={markdownMessage} />);

    expect(screen.getByTestId('markdown')).toBeInTheDocument();
  });

  it('displays single citation correctly', () => {
    const singleCitationMessage: AIMessageType = {
      id: '6',
      role: 'assistant',
      content: 'Test',
      timestamp: new Date().toISOString(),
      metadata: {
        citations: [
          {
            source: 'Document 1',
            url: 'https://example.com/doc1',
            excerpt: 'Excerpt',
          },
        ],
      },
    };

    render(<AIMessage message={singleCitationMessage} />);

    expect(screen.getByText(/1 source/i)).toBeInTheDocument();
  });
});
