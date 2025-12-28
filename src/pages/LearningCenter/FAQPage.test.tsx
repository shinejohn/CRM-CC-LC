import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { FAQIndexPage } from './FAQ/Index';

// Mock child components
vi.mock('../../components/LearningCenter/FAQ/FAQList', () => ({
  FAQList: () => <div data-testid="faq-list">FAQ List</div>,
}));

vi.mock('../../components/LearningCenter/Layout/LearningLayout', () => ({
  LearningLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="learning-layout">{children}</div>
  ),
}));

describe('FAQIndexPage', () => {
  it('renders FAQ page', () => {
    render(<FAQIndexPage />);

    expect(screen.getByTestId('faq-list')).toBeInTheDocument();
  });

  it('renders within LearningLayout', () => {
    render(<FAQIndexPage />);

    expect(screen.getByTestId('learning-layout')).toBeInTheDocument();
  });
});
