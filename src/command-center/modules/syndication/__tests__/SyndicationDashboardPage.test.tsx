import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../../test/test-utils';
import { SyndicationDashboardPage } from '../SyndicationDashboardPage';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useParams: () => ({}),
    useNavigate: () => mockNavigate,
  };
});

const mockDashboardData = {
  partner: {
    id: 'partner-1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    tier: { name: 'silver' as const, revenue_share_pct: 25, threshold: 500 },
    total_earned: 1250.0,
    this_month_earned: 320.0,
    community_count: 3,
    active_sponsor_count: 2,
  },
  earnings_history: [
    { month: 'Mar 2026', earned: 280, posts: 45, clicks: 1200 },
    { month: 'Apr 2026', earned: 320, posts: 52, clicks: 1450 },
  ],
};

vi.mock('../useSyndicationDashboard', () => ({
  useSyndicationDashboard: vi.fn(() => ({
    data: mockDashboardData,
    isLoading: false,
    isError: false,
    error: null,
  })),
  useSyndicationQueue: vi.fn(() => ({
    data: [
      {
        id: 'q-1',
        content_type: 'sponsored_post',
        preview_text: 'Check out Acme Coffee!',
        caption_text: 'Visit Acme Coffee for the best beans.',
        is_sponsored: true,
        sponsor_name: 'Acme Coffee',
        earnings_amount: 5.0,
        posted: false,
        scheduled_at: '2026-05-07T09:00:00Z',
      },
    ],
    isLoading: false,
  })),
  useSyndicationCommunities: vi.fn(() => ({
    data: [
      {
        id: 'com-1',
        platform: 'facebook_group',
        name: 'Springfield Community',
        url: 'https://facebook.com/groups/springfield',
        member_count: 5000,
        posts_this_month: 12,
        clicks_this_month: 340,
        earned_this_month: 85.0,
      },
    ],
    isLoading: false,
  })),
  useSyndicationSponsors: vi.fn(() => ({
    data: [
      {
        id: 'sp-1',
        smb_name: 'Acme Coffee',
        monthly_budget: 200,
        partner_cut: 50,
        posts_delivered: 8,
        clicks: 210,
      },
    ],
    isLoading: false,
  })),
  useSyndicationEarnings: vi.fn(() => ({
    data: {
      period: 'all',
      months: [
        { month: 'Mar 2026', earned: 280, posts: 45, clicks: 1200 },
        { month: 'Apr 2026', earned: 320, posts: 52, clicks: 1450 },
      ],
      total: 600,
    },
    isLoading: false,
  })),
  useRegisterPartner: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  })),
  useAddCommunity: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  })),
  useRemoveCommunity: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useMarkPosted: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

// Mock shared components to avoid pulling in their full dependency trees
vi.mock('@/components/shared', () => ({
  PageHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  ),
  DataCard: ({
    title,
    children,
  }: {
    title?: string;
    children: React.ReactNode;
    icon?: unknown;
    subtitle?: string;
  }) => (
    <div>
      {title && <h2>{title}</h2>}
      {children}
    </div>
  ),
  TabNav: ({
    tabs,
    activeTab,
    onTabChange,
  }: {
    tabs: Array<{ id: string; label: string }>;
    activeTab: string;
    onTabChange: (id: string) => void;
  }) => (
    <div data-testid="tab-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          data-active={tab.id === activeTab}
          aria-label={tab.label}
        >
          {tab.label}
        </button>
      ))}
    </div>
  ),
}));

describe('SyndicationDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', () => {
    render(<SyndicationDashboardPage />);

    expect(screen.getByText('Syndication Partner Dashboard')).toBeInTheDocument();
  });

  it('renders all 5 section tabs', () => {
    render(<SyndicationDashboardPage />);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText("Today's Content")).toBeInTheDocument();
    expect(screen.getByText('My Communities')).toBeInTheDocument();
    expect(screen.getByText('My Sponsors')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  it('defaults to overview section with stat cards', async () => {
    render(<SyndicationDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Total Earned')).toBeInTheDocument();
      expect(screen.getByText('This Month')).toBeInTheDocument();
      expect(screen.getByText('Communities')).toBeInTheDocument();
      expect(screen.getByText('Active Sponsors')).toBeInTheDocument();
    });
  });

  it('renders partner tier progress', async () => {
    render(<SyndicationDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Partner Tier')).toBeInTheDocument();
      expect(screen.getByText('Silver')).toBeInTheDocument();
    });
  });

  it('renders earnings history table', async () => {
    render(<SyndicationDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Earnings History')).toBeInTheDocument();
      expect(screen.getByText('Mar 2026')).toBeInTheDocument();
      expect(screen.getByText('Apr 2026')).toBeInTheDocument();
    });
  });

  it('shows registration form when dashboard returns 404', async () => {
    const { useSyndicationDashboard } = await import('../useSyndicationDashboard');
    (useSyndicationDashboard as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 404 },
    });

    render(<SyndicationDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Syndication Partner Program')).toBeInTheDocument();
      expect(screen.getAllByText('Become a Partner').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows error banner on non-404 errors', async () => {
    const { useSyndicationDashboard } = await import('../useSyndicationDashboard');
    (useSyndicationDashboard as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 500 },
    });

    render(<SyndicationDashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load syndication dashboard. Please try again later.'),
      ).toBeInTheDocument();
    });
  });
});
