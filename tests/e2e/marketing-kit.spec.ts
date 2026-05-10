import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_USER = {
  id: 'u-test-1',
  email: 'jane@lakelandcoffee.com',
  firstName: 'Jane',
  lastName: 'Doe',
  businessId: 'biz-1',
  role: 'owner',
  permissions: ['marketing-kit', 'content-cards'],
  createdAt: '2025-01-01T00:00:00Z',
};

const MOCK_BUSINESS = {
  id: 'biz-1',
  name: 'Lakeland Coffee Co',
  slug: 'lakeland-coffee-co',
  industry: 'food_and_beverage',
  tier: 'growth',
  subscriptionStatus: 'active',
  settings: {
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    locale: 'en-US',
    features: ['marketing-kit', 'content-cards', 'syndication'],
  },
  createdAt: '2025-01-01T00:00:00Z',
};

const MOCK_PROFILE = {
  id: 'mp-1',
  business_name: 'Lakeland Coffee Co',
  contact_name: 'Jane Doe',
  contact_title: 'Owner',
  phone: '863-555-1234',
  email: 'jane@lakelandcoffee.com',
  website: 'https://lakelandcoffee.com',
  accent_color: '#4f46e5',
  tagline: 'Brewed with love since 2012',
  logo_url: null,
  alphasite_url: 'lakeland-coffee-co-lakeland-fl.alphasite.ai',
  community: { name: 'Lakeland', state: 'FL', slug: 'lakeland' },
};

function mockContentCard(type: string) {
  return {
    id: `card-${type}`,
    type,
    variant: 'smb_self_post',
    headline: `${type.charAt(0).toUpperCase() + type.slice(1)} Headline`,
    body: `Body content for ${type} card.`,
    caption: `Caption for ${type} post #LakelandCoffee`,
    image_url: null,
    hashtags: `#${type} #Lakeland`,
    community_name: 'Lakeland',
    business_name: 'Lakeland Coffee Co',
    created_at: '2026-05-06',
  };
}

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
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h from now
      }),
    );
  });
}

async function mockApis(page: Page) {
  // Auth: /api/v1/auth/me
  await page.route('**/v1/auth/me', (route) =>
    route.fulfill({
      status: 200,
      json: { user: MOCK_USER, business: MOCK_BUSINESS },
    }),
  );

  // Marketing kit profile
  await page.route('**/marketing-kit/profile', (route) =>
    route.fulfill({ status: 200, json: MOCK_PROFILE }),
  );

  // Content cards
  await page.route('**/content-cards/today', (route) =>
    route.fulfill({ status: 200, json: mockContentCard('news') }),
  );

  await page.route('**/content-cards/preview/*', (route) => {
    const segments = new URL(route.request().url()).pathname.split('/');
    const type = segments[segments.length - 1];
    return route.fulfill({ status: 200, json: mockContentCard(type) });
  });

  // Generate email signature
  await page.route('**/marketing-kit/assets', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 200,
        json: { html: '<table><tr><td>Signature HTML</td></tr></table>' },
      });
    }
    return route.fulfill({ status: 200, json: [] });
  });
}

const TOOLS = [
  { label: 'Website Widget', heading: 'Website Widget' },
  { label: 'Menu Bar', heading: 'Menu Bar' },
  { label: 'Email Signature', heading: 'Email Signature' },
  { label: 'Social Headers', heading: 'Social Headers' },
  { label: 'Social Posts', heading: 'Social Posts' },
  { label: 'Branded Image', heading: 'Branded Image' },
] as const;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Marketing Kit', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockApis(page);
  });

  test('sidebar renders 6 tools', async ({ page }) => {
    await page.goto('/command-center/attract/marketing-kit');

    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    for (const tool of TOOLS) {
      await expect(
        sidebar.getByRole('button', { name: `Select ${tool.label} tool` }),
      ).toBeVisible();
    }
  });

  test('clicking each tool renders editor panel and preview', async ({ page }) => {
    await page.goto('/command-center/attract/marketing-kit');

    for (const tool of TOOLS) {
      await page
        .getByRole('button', { name: `Select ${tool.label} tool` })
        .click();

      // Each tool renders an h1 with its name
      const heading = page.getByRole('heading', { level: 1, name: tool.heading });
      await expect(heading).toBeVisible();
    }
  });

  test('Email Signature: toggling contact shows/hides fields', async ({ page }) => {
    await page.goto('/command-center/attract/marketing-kit/email-signature');

    // Verify contact name appears in the preview when toggle is ON (default)
    await expect(page.locator('table span', { hasText: 'Jane Doe' })).toBeVisible();

    // Toggle OFF the "Include individual contact" switch
    const toggle = page.getByRole('switch', {
      name: 'Toggle individual contact info in signature',
    });
    await expect(toggle).toBeVisible();
    await toggle.click();

    // After toggling off, contact name should disappear from the preview
    await expect(
      page.locator('table span', { hasText: 'Jane Doe' }),
    ).toBeHidden();

    // Toggle back ON
    await toggle.click();
    await expect(
      page.locator('table span', { hasText: 'Jane Doe' }),
    ).toBeVisible();
  });

  test('Social Headers: clicking platform tabs changes preview dimensions', async ({ page }) => {
    await page.goto('/command-center/attract/marketing-kit/social-headers');

    const platforms = [
      { tab: 'Facebook 820x312', label: 'Facebook', viewBox: '0 0 820 312' },
      { tab: 'X 1500x500', label: 'X', viewBox: '0 0 1500 500' },
      { tab: 'Instagram 1080x1080', label: 'Instagram', viewBox: '0 0 1080 1080' },
      { tab: 'TikTok 1080x1920', label: 'TikTok', viewBox: '0 0 1080 1920' },
    ];

    for (const platform of platforms) {
      // Click the platform tab (Radix TabsTrigger renders as button)
      await page.getByRole('button', { name: platform.tab }).click();

      // Verify the SVG preview has the correct viewBox
      const svg = page.locator(
        `svg[aria-label="${platform.label} header preview for Lakeland Coffee Co"]`,
      );
      await expect(svg).toBeVisible();
      await expect(svg).toHaveAttribute('viewBox', platform.viewBox);
    }
  });

  test('Branded Image: clicking themes updates preview colors', async ({ page }) => {
    await page.goto('/command-center/attract/marketing-kit/branded-image');

    const themes = [
      { label: 'Blue', gradientId: 'brand-grad-blue' },
      { label: 'Green', gradientId: 'brand-grad-green' },
      { label: 'Orange', gradientId: 'brand-grad-orange' },
      { label: 'Purple', gradientId: 'brand-grad-purple' },
      { label: 'Red', gradientId: 'brand-grad-red' },
      { label: 'Teal', gradientId: 'brand-grad-teal' },
    ];

    for (const theme of themes) {
      await page
        .getByRole('button', { name: `Select ${theme.label} color theme` })
        .click();

      // The SVG rect should reference the active theme's gradient
      const rect = page.locator('svg[role="img"] rect').first();
      await expect(rect).toHaveAttribute(
        'fill',
        `url(#${theme.gradientId})`,
      );
    }
  });
});

test.describe('Content Cards', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockApis(page);
  });

  test('clicking each content type updates card preview', async ({ page }) => {
    await page.goto('/command-center/attract/content-cards');

    const contentTypes = ['News', 'Events', 'Weather', 'Downtown', 'Spotlight'];

    for (const type of contentTypes) {
      await page.getByRole('button', { name: type, exact: true }).click();

      // The type badge should show in the card preview
      const badge = page.locator('span', { hasText: type }).first();
      await expect(badge).toBeVisible();
    }
  });

  test('Copy Caption calls clipboard API', async ({ page }) => {
    await page.goto('/command-center/attract/content-cards');

    // Wait for content to load
    await expect(page.locator('h3', { hasText: /Headline/ })).toBeVisible();

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

    // Click Copy Caption
    await page
      .getByRole('button', { name: 'Copy caption and hashtags to clipboard' })
      .click();

    // Button should show "Copied" state
    await expect(page.getByText('Copied')).toBeVisible();

    // Verify clipboard was called with caption content
    const clipboardText = await page.evaluate(
      () => (window as Record<string, unknown>).__clipboardText as string,
    );
    expect(clipboardText).toContain('Caption for news post');
  });
});
