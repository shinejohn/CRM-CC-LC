import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../../test/test-utils';
import { ContentCardsPage } from '../ContentCardsPage';

const mockCard = {
  id: 'card-1',
  type: 'news' as const,
  variant: 'smb_self_post' as const,
  headline: 'Local Park Reopens',
  body: 'Springfield Park is now open after renovations.',
  caption: 'Great news for the community!',
  image_url: null,
  hashtags: '#springfield #parks',
  community_name: 'Springfield',
  business_name: 'Acme Coffee',
  created_at: '2026-05-07T00:00:00Z',
};

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>(
    '@tanstack/react-query',
  );
  return {
    ...actual,
    useQuery: vi.fn(({ queryKey }: { queryKey: string[] }) => {
      if (queryKey.includes('today')) {
        return { data: mockCard, isLoading: false, error: null };
      }
      // preview queries
      return { data: mockCard, isLoading: false, error: null };
    }),
  };
});

describe('ContentCardsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('renders the page header', () => {
    render(<ContentCardsPage />);

    expect(screen.getByText('Content Cards')).toBeInTheDocument();
  });

  it('renders all 5 content type tabs', () => {
    render(<ContentCardsPage />);

    expect(screen.getAllByText('News').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Events').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Weather').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Downtown').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Spotlight').length).toBeGreaterThanOrEqual(1);
  });

  it('displays the card headline', () => {
    render(<ContentCardsPage />);

    expect(screen.getByText('Local Park Reopens')).toBeInTheDocument();
  });

  it('displays the card body text', () => {
    render(<ContentCardsPage />);

    expect(
      screen.getByText('Springfield Park is now open after renovations.'),
    ).toBeInTheDocument();
  });

  it('displays the caption text', () => {
    render(<ContentCardsPage />);

    expect(screen.getByText('Great news for the community!')).toBeInTheDocument();
  });

  it('displays hashtags', () => {
    render(<ContentCardsPage />);

    expect(screen.getByText('#springfield #parks')).toBeInTheDocument();
  });

  it('shows the variant toggle button', () => {
    render(<ContentCardsPage />);

    expect(
      screen.getByLabelText('Toggle between self-post and syndication variant'),
    ).toBeInTheDocument();
  });

  it('copies caption and hashtags to clipboard when Copy Caption is clicked', async () => {
    render(<ContentCardsPage />);

    const copyBtn = screen.getByText('Copy Caption');
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'Great news for the community!\n\n#springfield #parks',
      );
    });
  });

  it('shows "Copied" text after copying', async () => {
    render(<ContentCardsPage />);

    fireEvent.click(screen.getByText('Copy Caption'));

    await waitFor(() => {
      expect(screen.getByText('Copied')).toBeInTheDocument();
    });
  });

  it('toggles variant label when variant button is clicked', async () => {
    render(<ContentCardsPage />);

    const toggleBtn = screen.getByLabelText(
      'Toggle between self-post and syndication variant',
    );

    expect(toggleBtn).toHaveTextContent('SMB Self-Post');

    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(toggleBtn).toHaveTextContent('Syndication / Sponsored');
    });
  });
});
