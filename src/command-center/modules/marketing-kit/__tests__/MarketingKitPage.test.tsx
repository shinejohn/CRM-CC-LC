import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../../test/test-utils';
import { MarketingKitPage } from '../MarketingKitPage';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useParams: () => ({}),
    useNavigate: () => mockNavigate,
  };
});

const mockProfile = {
  id: 'prof-1',
  business_name: 'Acme Coffee',
  tagline: 'Best beans in town',
  contact_name: 'Jane Doe',
  contact_title: 'Owner',
  phone: '555-1234',
  email: 'jane@acme.coffee',
  website: 'https://acme.coffee',
  accent_color: '#4f46e5',
  logo_url: null,
  alphasite_url: 'https://alpha.test/acme',
  community: { name: 'Springfield', slug: 'springfield', state: 'IL' },
};

vi.mock('../useMarketingProfile', () => ({
  useMarketingProfile: vi.fn(() => ({
    data: mockProfile,
    isLoading: false,
    error: null,
  })),
}));

// Mock child tool components so we can detect which one renders
vi.mock('../WebsiteWidget', () => ({
  WebsiteWidget: () => <div data-testid="tool-website-widget">WebsiteWidget</div>,
}));
vi.mock('../MenuBarWidget', () => ({
  MenuBarWidget: () => <div data-testid="tool-menu-bar">MenuBarWidget</div>,
}));
vi.mock('../EmailSignature', () => ({
  EmailSignature: () => <div data-testid="tool-email-signature">EmailSignature</div>,
}));
vi.mock('../SocialHeaders', () => ({
  SocialHeaders: () => <div data-testid="tool-social-headers">SocialHeaders</div>,
}));
vi.mock('../SocialPosts', () => ({
  SocialPosts: () => <div data-testid="tool-social-posts">SocialPosts</div>,
}));
vi.mock('../BrandedImage', () => ({
  BrandedImage: () => <div data-testid="tool-branded-image">BrandedImage</div>,
}));

describe('MarketingKitPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sidebar with all 6 tools', () => {
    render(<MarketingKitPage />);

    expect(screen.getByText('Website Widget')).toBeInTheDocument();
    expect(screen.getByText('Menu Bar')).toBeInTheDocument();
    expect(screen.getByText('Email Signature')).toBeInTheDocument();
    expect(screen.getByText('Social Headers')).toBeInTheDocument();
    expect(screen.getByText('Social Posts')).toBeInTheDocument();
    expect(screen.getByText('Branded Image')).toBeInTheDocument();
  });

  it('renders both group headings', () => {
    render(<MarketingKitPage />);

    expect(screen.getByText('Widgets')).toBeInTheDocument();
    expect(screen.getByText('Images')).toBeInTheDocument();
  });

  it('defaults to Website Widget tool', () => {
    render(<MarketingKitPage />);

    expect(screen.getByTestId('tool-website-widget')).toBeInTheDocument();
  });

  it('switches to Email Signature when clicked', async () => {
    render(<MarketingKitPage />);

    fireEvent.click(screen.getByLabelText('Select Email Signature tool'));

    await waitFor(() => {
      expect(screen.getByTestId('tool-email-signature')).toBeInTheDocument();
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      '/command-center/attract/marketing-kit/email-signature',
      { replace: true },
    );
  });

  it('switches to Social Headers when clicked', async () => {
    render(<MarketingKitPage />);

    fireEvent.click(screen.getByLabelText('Select Social Headers tool'));

    await waitFor(() => {
      expect(screen.getByTestId('tool-social-headers')).toBeInTheDocument();
    });
  });

  it('switches to Branded Image when clicked', async () => {
    render(<MarketingKitPage />);

    fireEvent.click(screen.getByLabelText('Select Branded Image tool'));

    await waitFor(() => {
      expect(screen.getByTestId('tool-branded-image')).toBeInTheDocument();
    });
  });

  it('shows loading spinner when profile is loading', async () => {
    const { useMarketingProfile } = await import('../useMarketingProfile');
    (useMarketingProfile as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = render(<MarketingKitPage />);

    // Loader2 renders an SVG with animate-spin
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('shows error state with retry button when profile fails', async () => {
    const { useMarketingProfile } = await import('../useMarketingProfile');
    (useMarketingProfile as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    });

    render(<MarketingKitPage />);

    expect(screen.getByText('Unable to load your marketing profile.')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});
