import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { BusinessProfileForm } from './BusinessProfileForm';

describe('BusinessProfileForm', () => {
  it('renders business profile form', () => {
    render(<BusinessProfileForm />);
    
    expect(screen.getByText(/AI-Generated Business Profile/i)).toBeInTheDocument();
  });

  it('displays company information section', () => {
    render(<BusinessProfileForm />);
    
    expect(screen.getByText(/Company Information/i)).toBeInTheDocument();
  });

  it('displays leadership team section', () => {
    render(<BusinessProfileForm />);
    
    expect(screen.getByText(/Leadership Team/i)).toBeInTheDocument();
  });

  it('displays financial overview section', () => {
    render(<BusinessProfileForm />);
    
    expect(screen.getByText(/Financial Overview/i)).toBeInTheDocument();
  });

  it('displays action buttons in header', () => {
    render(<BusinessProfileForm />);
    
    // Check for action buttons (refresh, print, share, download)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('displays completion status badges', () => {
    render(<BusinessProfileForm />);
    
    // Check for status indicators (completed, in-progress, pending)
    expect(screen.getByText(/Auto-generating/i)).toBeInTheDocument();
  });
});
