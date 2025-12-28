import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { CategorySidebar } from './CategorySidebar';

describe('CategorySidebar', () => {
  it('renders category sidebar', () => {
    render(<CategorySidebar />);

    expect(screen.getByText(/email campaigns/i)).toBeInTheDocument();
  });

  it('renders main navigation sections', () => {
    render(<CategorySidebar />);

    expect(screen.getByText(/content/i)).toBeInTheDocument();
    expect(screen.getByText(/search/i)).toBeInTheDocument();
    expect(screen.getByText(/ai training/i)).toBeInTheDocument();
  });
});
