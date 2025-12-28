import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { LearningLayout } from './LearningLayout';

vi.mock('../Layout/CategorySidebar', () => ({
  CategorySidebar: () => <div data-testid="category-sidebar">Sidebar</div>,
}));

vi.mock('../Layout/SearchHeader', () => ({
  SearchHeader: () => <div data-testid="search-header">Search</div>,
}));

describe('LearningLayout', () => {
  it('renders learning layout', () => {
    render(<LearningLayout title="Test">Content</LearningLayout>);

    expect(screen.getByText(/test/i)).toBeInTheDocument();
    expect(screen.getByText(/content/i)).toBeInTheDocument();
  });

  it('renders sidebar and header', () => {
    render(<LearningLayout title="Test">Content</LearningLayout>);

    expect(screen.getByTestId('category-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('search-header')).toBeInTheDocument();
  });
});
