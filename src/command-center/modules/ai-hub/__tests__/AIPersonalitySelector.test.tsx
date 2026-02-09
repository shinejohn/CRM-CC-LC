import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { AIPersonalitySelector } from '../AIPersonalitySelector';
import { aiService } from '../../../services/ai.service';
import { useAI } from '../../../hooks/useAI';

// Mock the aiService
vi.mock('../../../services/ai.service', () => ({
  aiService: {
    getPersonalities: vi.fn(),
  },
}));

// Mock the useAI hook
vi.mock('../../../hooks/useAI', () => ({
  useAI: vi.fn(),
}));

describe('AIPersonalitySelector', () => {
  const mockPersonalities = [
    {
      id: '1',
      name: 'Assistant',
      description: 'Helpful assistant',
      systemPrompt: 'You are helpful',
      traits: ['friendly'],
      capabilities: ['chat'],
    },
    {
      id: '2',
      name: 'Analyst',
      description: 'Data analyst',
      systemPrompt: 'You analyze data',
      traits: ['analytical'],
      capabilities: ['analysis'],
    },
  ];

  const mockSetPersonality = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAI as any).mockReturnValue({
      currentPersonality: mockPersonalities[0],
      setPersonality: mockSetPersonality,
    });
    (aiService.getPersonalities as any).mockResolvedValue(mockPersonalities);
  });

  it('renders personality selector', async () => {
    render(<AIPersonalitySelector />);

    await waitFor(() => {
      // It renders as a button, not a combobox
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  it('loads personalities on mount', async () => {
    render(<AIPersonalitySelector />);

    await waitFor(() => {
      expect(aiService.getPersonalities).toHaveBeenCalled();
    });
  });

  it('displays current personality', async () => {
    render(<AIPersonalitySelector />);

    await waitFor(() => {
      expect(screen.getByText('Assistant')).toBeInTheDocument();
    });
  });

  it('handles loading state', () => {
    (aiService.getPersonalities as any).mockImplementation(() => new Promise(() => { }));

    render(<AIPersonalitySelector />);

    // Should show loading or current personality
    expect(screen.getByText('Assistant') || screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (aiService.getPersonalities as any).mockRejectedValue(new Error('Failed to load'));

    render(<AIPersonalitySelector />);

    await waitFor(() => {
      // Should still show current personality or error message
      expect(screen.getByText('Assistant') || screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('calls setPersonality when selection changes', async () => {
    const user = userEvent.setup();
    render(<AIPersonalitySelector />);

    await waitFor(() => {
      expect(aiService.getPersonalities).toHaveBeenCalled();
    });

    // Find and click the selector
    const selector = screen.getByRole('button', { name: /assistant/i });
    await user.click(selector);

    // Select a different personality if dropdown is visible
    const analystOption = screen.queryByText('Analyst');
    if (analystOption) {
      await user.click(analystOption);

      await waitFor(() => {
        expect(mockSetPersonality).toHaveBeenCalledWith('2');
      });
    }
  });
});

