import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../../test/test-utils';
import { AIHubPage } from '../AIHubPage';
import { useAI } from '../../../hooks/useAI';

// Mock the useAI hook
vi.mock('../../../hooks/useAI', () => ({
  useAI: vi.fn(),
}));

// Mock child components
vi.mock('../AIChat', () => ({
  AIChat: () => <div data-testid="ai-chat">AI Chat</div>,
}));

vi.mock('../AIWorkflowPanel', () => ({
  AIWorkflowPanel: () => <div data-testid="ai-workflow-panel">AI Workflow Panel</div>,
}));

vi.mock('../AIAnalysisPanel', () => ({
  AIAnalysisPanel: () => <div data-testid="ai-analysis-panel">AI Analysis Panel</div>,
}));

vi.mock('../AICapabilities', () => ({
  AICapabilities: () => <div data-testid="ai-capabilities">AI Capabilities</div>,
}));

vi.mock('../AIPersonalitySelector', () => ({
  AIPersonalitySelector: () => <div data-testid="ai-personality-selector">AI Personality Selector</div>,
}));

describe('AIHubPage', () => {
  const mockUseAI = {
    currentPersonality: {
      id: '1',
      name: 'Assistant',
      description: 'Helpful assistant',
      systemPrompt: 'You are helpful',
      traits: ['friendly'],
      capabilities: ['chat'],
    },
    isLoading: false,
    messages: [],
    isStreaming: false,
    error: null,
    sendMessage: vi.fn(),
    regenerate: vi.fn(),
    clearHistory: vi.fn(),
    setContext: vi.fn(),
    setPersonality: vi.fn(),
    generate: vi.fn(),
    abortStream: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAI as any).mockReturnValue(mockUseAI);
  });

  it('renders AI Hub page with header', () => {
    render(<AIHubPage />);
    
    expect(screen.getByText('AI Hub')).toBeInTheDocument();
    expect(screen.getByText(/Default Assistant|Assistant/)).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    render(<AIHubPage />);
    
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Workflows')).toBeInTheDocument();
    expect(screen.getByText('Analysis')).toBeInTheDocument();
    expect(screen.getByText('Capabilities')).toBeInTheDocument();
  });

  it('displays chat tab content by default', () => {
    render(<AIHubPage />);
    
    expect(screen.getByTestId('ai-chat')).toBeInTheDocument();
  });

  it('switches to workflows tab when clicked', async () => {
    render(<AIHubPage />);
    
    const workflowsTab = screen.getByText('Workflows');
    fireEvent.click(workflowsTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('ai-workflow-panel')).toBeInTheDocument();
    });
  });

  it('switches to analysis tab when clicked', async () => {
    render(<AIHubPage />);
    
    const analysisTab = screen.getByText('Analysis');
    fireEvent.click(analysisTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('ai-analysis-panel')).toBeInTheDocument();
    });
  });

  it('switches to capabilities tab when clicked', async () => {
    render(<AIHubPage />);
    
    const capabilitiesTab = screen.getByText('Capabilities');
    fireEvent.click(capabilitiesTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('ai-capabilities')).toBeInTheDocument();
    });
  });

  it('renders personality selector', () => {
    render(<AIHubPage />);
    
    expect(screen.getByTestId('ai-personality-selector')).toBeInTheDocument();
  });

  it('displays quick action buttons', () => {
    render(<AIHubPage />);
    
    expect(screen.getByText('Write Content')).toBeInTheDocument();
    expect(screen.getByText('Analyze Data')).toBeInTheDocument();
    expect(screen.getByText('Brainstorm Ideas')).toBeInTheDocument();
    expect(screen.getByText('Draft Email')).toBeInTheDocument();
    expect(screen.getByText('Generate Report')).toBeInTheDocument();
  });

  it('shows connection status indicator', () => {
    render(<AIHubPage />);
    
    // Check for connection status dot (it's a span with w-2 h-2 classes)
    const statusIndicator = document.querySelector('.w-2.h-2.rounded-full');
    expect(statusIndicator).toBeTruthy();
  });

  it('displays current personality name', () => {
    render(<AIHubPage />);
    
    expect(screen.getByText('Assistant')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    (useAI as any).mockReturnValue({
      ...mockUseAI,
      isLoading: true,
      currentPersonality: null,
    });
    
    render(<AIHubPage />);
    
    expect(screen.getByText('Default Assistant')).toBeInTheDocument();
  });
});

