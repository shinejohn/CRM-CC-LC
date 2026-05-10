import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../../test/test-utils';
import { SocialHeaders } from '../SocialHeaders';
import type { MarketingProfile } from '../useMarketingProfile';

const mockProfile: MarketingProfile = {
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

describe('SocialHeaders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 4 platform tabs', () => {
    render(<SocialHeaders profile={mockProfile} />);

    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('TikTok')).toBeInTheDocument();
  });

  it('renders dimension labels for each platform', () => {
    render(<SocialHeaders profile={mockProfile} />);

    expect(screen.getByText('820x312')).toBeInTheDocument();
    expect(screen.getByText('1500x500')).toBeInTheDocument();
    expect(screen.getByText('1080x1080')).toBeInTheDocument();
    expect(screen.getByText('1080x1920')).toBeInTheDocument();
  });

  it('defaults to Facebook with correct SVG viewBox', () => {
    render(<SocialHeaders profile={mockProfile} />);

    const svg = screen.getByRole('img', { name: /Facebook header preview/i });
    expect(svg).toHaveAttribute('viewBox', '0 0 820 312');
  });

  it('switches to X platform and updates SVG viewBox', async () => {
    render(<SocialHeaders profile={mockProfile} />);

    fireEvent.click(screen.getByText('X'));

    await waitFor(() => {
      const svg = screen.getByRole('img', { name: /X header preview/i });
      expect(svg).toHaveAttribute('viewBox', '0 0 1500 500');
    });
  });

  it('switches to Instagram platform and updates SVG viewBox', async () => {
    render(<SocialHeaders profile={mockProfile} />);

    fireEvent.click(screen.getByText('Instagram'));

    await waitFor(() => {
      const svg = screen.getByRole('img', { name: /Instagram header preview/i });
      expect(svg).toHaveAttribute('viewBox', '0 0 1080 1080');
    });
  });

  it('switches to TikTok platform and updates SVG viewBox', async () => {
    render(<SocialHeaders profile={mockProfile} />);

    fireEvent.click(screen.getByText('TikTok'));

    await waitFor(() => {
      const svg = screen.getByRole('img', { name: /TikTok header preview/i });
      expect(svg).toHaveAttribute('viewBox', '0 0 1080 1920');
    });
  });

  it('renders download SVG and PNG buttons', () => {
    render(<SocialHeaders profile={mockProfile} />);

    expect(screen.getByLabelText(/Download Facebook header as SVG/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Download Facebook header as PNG/i)).toBeInTheDocument();
  });

  it('displays the business name in the SVG preview', () => {
    render(<SocialHeaders profile={mockProfile} />);

    const svg = screen.getByRole('img', { name: /Facebook header preview/i });
    const textEls = svg.querySelectorAll('text');
    const names = Array.from(textEls).map((t) => t.textContent);
    expect(names).toContain('Acme Coffee');
  });

  it('displays the tagline in the SVG preview', () => {
    render(<SocialHeaders profile={mockProfile} />);

    const svg = screen.getByRole('img', { name: /Facebook header preview/i });
    const textEls = svg.querySelectorAll('text');
    const texts = Array.from(textEls).map((t) => t.textContent);
    expect(texts).toContain('Best beans in town');
  });

  it('renders platform-specific tips', () => {
    render(<SocialHeaders profile={mockProfile} />);

    expect(screen.getByText('Facebook Tips')).toBeInTheDocument();
    expect(
      screen.getByText(/Cover photo is cropped differently on mobile/),
    ).toBeInTheDocument();
  });
});
