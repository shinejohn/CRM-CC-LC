import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_USER = {
  id: 'u-syndication-1',
  email: 'maria@community.com',
  firstName: 'Maria',
  lastName: 'Garcia',
  businessId: 'biz-2',
  role: 'owner',
  permissions: ['syndication'],
  createdAt: '2025-01-01T00:00:00Z',
};

const MOCK_BUSINESS = {
  id: 'biz-2',
  name: 'Maria Community Media',
  slug: 'maria-community-media',
  industry: 'media',
  tier: 'growth',
  subscriptionStatus: 'active',
  settings: {
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    locale: 'en-US',
    features: ['syndication'],
  },
  createdAt: '2025-01-01T00:00:00Z',
};

const MOCK_PARTNER = {
  id: 'partner-1',
  name: 'Maria Garcia',
  email: 'maria@community.com',
  total_earned: 1245.5,
  this_month_earned: 320.0,
  community_count: 4,
  active_sponsor_count: 2,
  tier: { name: 'silver' as const, revenue_share_pct: 25 },
};

const MOCK_DASHBOARD = {
  partner: MOCK_PARTNER,
  earnings_history: [
    { month: 'May 2026', posts: 42, clicks: 1280, earned: 320.0 },
    { month: 'Apr 2026', posts: 38, clicks: 1150, earned: 287.5 },
    { month: 'Mar 2026', posts: 45, clicks: 1400, earned: 350.0 },
  ],
};

const MOCK_QUEUE = [
  {
    id: 'qc-1',
    content_type: 'sponsored_post' as const,
    preview_text: 'Check out the grand opening of Lakeland BBQ this Saturday!',
    caption_text: 'Lakeland BBQ is opening! #LakelandBBQ #GrandOpening',
    is_sponsored: true,
    earnings_amount: 12.5,
    posted: false,
  },
  {
    id: 'qc-2',
    content_type: 'article' as const,
    preview_text: 'City council approves new downtown park renovation project.',
    caption_text: 'Big news for downtown! #Lakeland #CityCouncil',
    is_sponsored: false,
    earnings_amount: null,
    posted: true,
  },
];

const MOCK_COMMUNITIES = [
  {
    id: 'comm-1',
    platform: 'facebook_group' as const,
    name: 'Lakeland Community Hub',
    url: 'https://facebook.com/groups/lakeland',
    member_count: 12500,
    posts_this_month: 28,
    clicks_this_month: 850,
    earned_this_month: 210.0,
  },
  {
    id: 'comm-2',
    platform: 'nextdoor' as const,
    name: 'South Lakeland Neighbors',
    url: 'https://nextdoor.com/lakeland-south',
    member_count: 4200,
    posts_this_month: 14,
    clicks_this_month: 430,
    earned_this_month: 110.0,
  },
];

const MOCK_SPONSORS = [
  {
    id: 'sp-1',
    smb_name: 'Lakeland BBQ',
    monthly_budget: 500,
    posts_delivered: 18,
    clicks: 540,
    partner_cut: 125.0,
  },
  {
    id: 'sp-2',
    smb_name: 'Sunshine Auto Repair',
    monthly_budget: 300,
    posts_delivered: 12,
    clicks: 360,
    partner_cut: 75.0,
  },
];

const MOCK_EARNINGS = {
  months: [
    { month: 'May 2026', posts: 42, clicks: 1280, earned: 320.0 },
    { month: 'Apr 2026', posts: 38, clicks: 1150, earned: 287.5 },
    { month: 'Mar 2026', posts: 45, clicks: 1400, earned: 350.0 },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function seedAuth(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'cc_auth_tokens',
      JSON.stringify({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      }),
    );
  });
}

async function mockApis(page: Page) {
  // Auth
  await page.route('**/v1/auth/me', (route) =>
    route.fulfill({
      status: 200,
      json: { user: MOCK_USER, business: MOCK_BUSINESS },
    }),
  );

  // Syndication endpoints
  await page.route('**/syndication/dashboard', (route) =>
    route.fulfill({ status: 200, json: MOCK_DASHBOARD }),
  );

  await page.route('**/syndication/queue', (route) =>
    route.fulfill({ status: 200, json: MOCK_QUEUE }),
  );

  await page.route('**/syndication/communities', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 200, json: MOCK_COMMUNITIES });
    }
    return route.fulfill({ status: 201, json: { id: 'comm-new', ...MOCK_COMMUNITIES[0] } });
  });

  await page.route('**/syndication/sponsors', (route) =>
    route.fulfill({ status: 200, json: MOCK_SPONSORS }),
  );

  await page.route('**/syndication/earnings', (route) =>
    route.fulfill({ status: 200, json: MOCK_EARNINGS }),
  );

  await page.route('**/syndication/posted/*', (route) =>
    route.fulfill({ status: 200, json: { success: true } }),
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Syndication Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockApis(page);
  });

  test('clicking all 5 tabs renders each section', async ({ page }) => {
    await page.goto('/command-center/syndication');

    // Overview tab should be active by default
    await expect(page.getByText('Syndication Partner Dashboard')).toBeVisible();

    // Tab definitions with expected content
    const tabs = [
      { name: 'Overview', expectedText: 'Total Earned' },
      { name: "Today's Content", expectedText: "today's queue" },
      { name: 'My Communities', expectedText: 'connected communit' },
      { name: 'My Sponsors', expectedText: 'active sponsor' },
      { name: 'Performance', expectedText: 'Monthly Earnings' },
    ];

    for (const tab of tabs) {
      await page.getByRole('button', { name: tab.name }).click();
      await expect(
        page.getByText(tab.expectedText, { exact: false }),
      ).toBeVisible();
    }
  });

  test('Overview tab shows stat cards with numbers', async ({ page }) => {
    await page.goto('/command-center/syndication');

    // Verify stat cards render with formatted values
    await expect(page.getByText('$1,245.50')).toBeVisible();
    // $320.00 appears in both stat card and earnings table — use first
    await expect(page.getByText('$320.00').first()).toBeVisible();

    // Tier progress should show Silver
    await expect(page.getByText('Silver')).toBeVisible();

    // Earnings history table should have rows
    await expect(page.getByText('May 2026')).toBeVisible();
    await expect(page.getByText('Apr 2026')).toBeVisible();
  });

  test('Copy Post on daily queue calls clipboard', async ({ page }) => {
    await page.goto('/command-center/syndication');

    // Navigate to Today's Content tab
    await page.getByRole('button', { name: "Today's Content" }).click();

    // Wait for queue items to render
    await expect(page.getByText("today's queue", { exact: false })).toBeVisible();

    // Mock the clipboard API
    await page.evaluate(() => {
      (window as Record<string, unknown>).__clipboardText = '';
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: (text: string) => {
            (window as Record<string, unknown>).__clipboardText = text;
            return Promise.resolve();
          },
          readText: () =>
            Promise.resolve(
              (window as Record<string, unknown>).__clipboardText as string,
            ),
        },
        writable: true,
        configurable: true,
      });
    });

    // Click the first "Copy Post" button
    const copyButtons = page.getByRole('button', { name: 'Copy post caption' });
    await copyButtons.first().click();

    // Button should show "Copied" state
    await expect(page.getByText('Copied').first()).toBeVisible();

    // Verify clipboard content
    const clipboardText = await page.evaluate(
      () => (window as Record<string, unknown>).__clipboardText as string,
    );
    expect(clipboardText).toContain('Lakeland BBQ');
  });

  test('earnings display shows formatted dollar amounts', async ({ page }) => {
    await page.goto('/command-center/syndication');

    // Overview stat cards
    await expect(page.getByText('$1,245.50')).toBeVisible();
    await expect(page.getByText('$320.00').first()).toBeVisible();

    // Navigate to Performance tab
    await page.getByRole('button', { name: 'Performance' }).click();

    // Engagement breakdown should show aggregated numbers
    await expect(page.getByText('Total Posts')).toBeVisible();
    await expect(page.getByText('Total Clicks')).toBeVisible();
    await expect(page.getByText('Total Earned').last()).toBeVisible();

    // Check that dollar amounts are rendered (formatted by Intl.NumberFormat)
    await expect(page.getByText('$957.50')).toBeVisible();
  });
});
