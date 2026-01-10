import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactSalesModal } from './ContactSalesModal';
import { contactApi } from '@/services/learning/contact-api';

// Mock the API
vi.mock('@/services/learning/contact-api', () => ({
  contactApi: {
    contactSales: vi.fn(),
  },
}));

describe('ContactSalesModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    campaignId: 'TEST-001',
    campaignSlug: 'test-campaign',
    campaignTitle: 'Test Campaign',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(<ContactSalesModal {...defaultProps} />);
    expect(screen.getByText('Contact Sales')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ContactSalesModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Contact Sales')).not.toBeInTheDocument();
  });

  it('shows campaign title when provided', () => {
    render(<ContactSalesModal {...defaultProps} />);
    expect(screen.getByText(/Regarding: Test Campaign/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<ContactSalesModal {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });

    expect(contactApi.contactSales).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(<ContactSalesModal {...defaultProps} />);
    
    // Fill required fields first
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    
    // Fill all fields using fireEvent (consistent with other tests)
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'notanemail' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message that is long enough to pass validation' } });
    
    // Get the form element and submit it properly
    const form = emailInput.closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      // Fallback: click submit button
      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);
    }

    // Wait for validation error to appear
    await waitFor(() => {
      // The error should appear in the email-error element
      const errorElement = document.getElementById('email-error');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement?.textContent).toMatch(/valid email/i);
    }, { timeout: 2000 });
  });

  it('validates message length', async () => {
    render(<ContactSalesModal {...defaultProps} />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Short' } });
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    vi.mocked(contactApi.contactSales).mockResolvedValue({
      success: true,
      message: 'Thank you!',
    });

    render(<ContactSalesModal {...defaultProps} />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'I am interested in learning more about your services.' } });
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(contactApi.contactSales).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          message: 'I am interested in learning more about your services.',
          campaign_id: 'TEST-001',
          campaign_slug: 'test-campaign',
        })
      );
    });
  });

  it('shows success message after submission', async () => {
    vi.mocked(contactApi.contactSales).mockResolvedValue({
      success: true,
      message: 'Thank you!',
    });

    render(<ContactSalesModal {...defaultProps} />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'I am interested in learning more.' } });
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/thank you/i)).toBeInTheDocument();
      expect(screen.getByText(/sales team will reach out/i)).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    vi.mocked(contactApi.contactSales).mockRejectedValue(
      new Error('Network error')
    );

    render(<ContactSalesModal {...defaultProps} />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'I am interested in learning more.' } });
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Error message might be in multiple places, check for error text
      const errorElements = screen.getAllByText(/error/i);
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  it('closes on escape key', () => {
    const onClose = vi.fn();
    render(<ContactSalesModal {...defaultProps} onClose={onClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on backdrop click', () => {
    const onClose = vi.fn();
    render(<ContactSalesModal {...defaultProps} onClose={onClose} />);
    
    const backdrop = document.querySelector('.bg-black.bg-opacity-50');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it('includes UTM parameters in submission', async () => {
    vi.mocked(contactApi.contactSales).mockResolvedValue({
      success: true,
      message: 'Thank you!',
    });

    render(
      <ContactSalesModal
        {...defaultProps}
        utmSource="google"
        utmMedium="cpc"
        utmCampaign="test-campaign"
      />
    );
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'I am interested.' } });
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(contactApi.contactSales).toHaveBeenCalledWith(
        expect.objectContaining({
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'test-campaign',
        })
      );
    });
  });
});


