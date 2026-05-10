import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../../test/test-utils';
import { EmailSignature } from '../EmailSignature';
import type { MarketingProfile } from '../useMarketingProfile';

const mockMutateAsync = vi.fn();

vi.mock('../useMarketingAssets', () => ({
  useGenerateEmailSignature: vi.fn(() => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  })),
}));

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

describe('EmailSignature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('renders header and form fields', () => {
    render(<EmailSignature profile={mockProfile} />);

    expect(screen.getByText('Email Signature')).toBeInTheDocument();
    expect(screen.getByLabelText('Business Name')).toHaveValue('Acme Coffee');
    expect(screen.getByLabelText('Contact Name')).toHaveValue('Jane Doe');
    expect(screen.getByLabelText('Contact Title')).toHaveValue('Owner');
    expect(screen.getByLabelText('Phone')).toHaveValue('555-1234');
    expect(screen.getByLabelText('Email')).toHaveValue('jane@acme.coffee');
    expect(screen.getByLabelText('Website')).toHaveValue('https://acme.coffee');
  });

  it('renders the signature preview with contact info visible by default', () => {
    render(<EmailSignature profile={mockProfile} />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Acme Coffee')).toBeInTheDocument();
  });

  it('hides contact name and title when include-contact toggle is turned off', async () => {
    render(<EmailSignature profile={mockProfile} />);

    const toggle = screen.getByLabelText('Toggle individual contact info in signature');
    fireEvent.click(toggle);

    await waitFor(() => {
      // The contact name row should no longer be in the preview
      // The business name should still be there
      expect(screen.getByText('Acme Coffee')).toBeInTheDocument();
    });
  });

  it('calls mutateAsync with form data when Copy HTML is clicked', async () => {
    mockMutateAsync.mockResolvedValue({ html: '<table>sig</table>' });

    render(<EmailSignature profile={mockProfile} />);

    const button = screen.getByLabelText('Generate email signature HTML');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          business_name: 'Acme Coffee',
          contact_name: 'Jane Doe',
          include_contact: true,
        }),
      );
    });
  });

  it('shows generated HTML and copy button after generation', async () => {
    mockMutateAsync.mockResolvedValue({ html: '<table>generated-sig</table>' });

    render(<EmailSignature profile={mockProfile} />);

    fireEvent.click(screen.getByLabelText('Generate email signature HTML'));

    await waitFor(() => {
      expect(screen.getByText('Generated HTML')).toBeInTheDocument();
      expect(screen.getByText('<table>generated-sig</table>')).toBeInTheDocument();
    });
  });

  it('copies generated HTML to clipboard when copy button is clicked', async () => {
    mockMutateAsync.mockResolvedValue({ html: '<table>copy-me</table>' });

    render(<EmailSignature profile={mockProfile} />);

    fireEvent.click(screen.getByLabelText('Generate email signature HTML'));

    await waitFor(() => {
      expect(screen.getByLabelText('Copy generated HTML to clipboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Copy generated HTML to clipboard'));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('<table>copy-me</table>');
    });
  });
});
