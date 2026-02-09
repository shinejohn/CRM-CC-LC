import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { AIChat } from '../AIChat';
import { useAI } from '../../../hooks/useAI';

// Mock the useAI hook
vi.mock('../../../hooks/useAI', () => ({
  useAI: vi.fn(),
}));

// Mock AIMessage component
vi.mock('../AIMessage', () => ({
  AIMessage: ({ message }: any) => (
    <div data-testid={`message-${message.id}`}>
      <span data-testid={`message-role-${message.id}`}>{message.role}</span>
      <span data-testid={`message-content-${message.id}`}>{message.content}</span>
    </div>
  ),
}));

// Mock ToolCallIndicator component
vi.mock('../ToolCallIndicator', () => ({
  ToolCallIndicator: ({ toolCall }: any) => (
    <div data-testid={`tool-call-${toolCall.id}`}>{toolCall.name}</div>
  ),
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe('AIChat', () => {
  const mockSendMessage = vi.fn();
  const mockRegenerate = vi.fn();
  const mockAbortStream = vi.fn();

  const mockUseAI = {
    messages: [],
    isLoading: false,
    isStreaming: false,
    error: null,
    sendMessage: mockSendMessage,
    regenerate: mockRegenerate,
    abortStream: mockAbortStream,
    clearHistory: vi.fn(),
    setContext: vi.fn(),
    setPersonality: vi.fn(),
    generate: vi.fn(),
    currentPersonality: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAI as any).mockReturnValue(mockUseAI);
  });

  it('renders chat interface', () => {
    render(<AIChat />);

    expect(screen.getByPlaceholderText(/ask anything/i)).toBeInTheDocument();
    // Send button is an icon button, find by aria-label or testid
    const sendButton = screen.getByRole('button', { name: /send/i }) ||
      document.querySelector('button[type="submit"]');
    expect(sendButton).toBeInTheDocument();
  });

  it('displays welcome message when no messages', () => {
    render(<AIChat />);

    expect(screen.getByText(/welcome|get started|how can i help/i)).toBeInTheDocument();
  });

  it('displays messages from useAI hook', () => {
    const messages = [
      {
        id: '1',
        role: 'user' as const,
        content: 'Hello',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        role: 'assistant' as const,
        content: 'Hi there!',
        timestamp: new Date().toISOString(),
      },
    ];

    (useAI as any).mockReturnValue({
      ...mockUseAI,
      messages,
    });

    render(<AIChat />);

    expect(screen.getByTestId('message-1')).toBeInTheDocument();
    expect(screen.getByTestId('message-2')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('sends message when form is submitted', async () => {
    const user = userEvent.setup();
    render(<AIChat />);

    const input = screen.getByPlaceholderText(/ask anything/i);
    const form = input.closest('form');

    await user.type(input, 'Test message');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    });
  });

  it('does not send empty message', async () => {
    render(<AIChat />);

    const input = screen.getByPlaceholderText(/ask anything/i);
    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('clears input after sending message', async () => {
    const user = userEvent.setup();
    render(<AIChat />);

    const input = screen.getByPlaceholderText(/ask anything/i) as HTMLTextAreaElement;
    const form = input.closest('form');

    await user.type(input, 'Test message');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('displays loading state', () => {
    (useAI as any).mockReturnValue({
      ...mockUseAI,
      isLoading: true,
      messages: [{ id: '1', role: 'user', content: 'test' }],
    });

    render(<AIChat />);

    const input = screen.getByPlaceholderText(/ask anything/i);
    expect(input).toBeDisabled();
    expect(screen.getByText(/thinking/i)).toBeInTheDocument();
  });

  it('displays streaming state', () => {
    (useAI as any).mockReturnValue({
      ...mockUseAI,
      isStreaming: true,
    });

    render(<AIChat />);

    const stopButton = screen.queryByRole('button', { name: /stop/i }) ||
      screen.queryByText(/stop/i) ||
      document.querySelector('button[aria-label*="stop" i]');
    expect(stopButton).toBeTruthy();
  });

  it('aborts stream when stop button is clicked', async () => {
    const user = userEvent.setup();
    (useAI as any).mockReturnValue({
      ...mockUseAI,
      isStreaming: true,
    });

    render(<AIChat />);

    const stopButton = screen.queryByRole('button', { name: /stop/i }) ||
      screen.queryByText(/stop/i) ||
      document.querySelector('button[aria-label*="stop" i]');
    if (stopButton) {
      await user.click(stopButton as HTMLElement);
      expect(mockAbortStream).toHaveBeenCalled();
    }
  });

  it('displays error message', () => {
    (useAI as any).mockReturnValue({
      ...mockUseAI,
      error: 'Failed to send message',
    });

    render(<AIChat />);

    expect(screen.getByText('Failed to send message')).toBeInTheDocument();
  });

  it('displays tool calls when present', () => {
    const messages = [
      {
        id: '1',
        role: 'assistant' as const,
        content: 'Processing...',
        timestamp: new Date().toISOString(),
        metadata: {
          toolCalls: [
            {
              id: 'tc-1',
              name: 'search',
              arguments: { query: 'test' },
              status: 'running',
            },
          ],
        },
      },
    ];

    (useAI as any).mockReturnValue({
      ...mockUseAI,
      messages,
    });

    render(<AIChat />);

    expect(screen.getByTestId('tool-call-tc-1')).toBeInTheDocument();
  });

  it('handles Enter key to send message', async () => {
    const user = userEvent.setup();
    render(<AIChat />);

    const input = screen.getByPlaceholderText(/ask anything/i);
    await user.type(input, 'Test message{Enter}');

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    });
  });

  it('handles Shift+Enter to create new line', async () => {
    const user = userEvent.setup();
    render(<AIChat />);

    const input = screen.getByPlaceholderText(/ask anything/i);
    await user.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

    expect(mockSendMessage).not.toHaveBeenCalled();
    expect((input as HTMLTextAreaElement).value).toContain('Line 1');
    expect((input as HTMLTextAreaElement).value).toContain('Line 2');
  });
});

