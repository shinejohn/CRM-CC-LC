import { describe, it, expect } from 'vitest';
import { render } from '../../../test/test-utils';
import { FibonaccoPlayer } from './FibonaccoPlayer';
import type { Presentation } from '@/types/learning';

const mockPresentation: Presentation = {
  id: 'test-123',
  title: 'Test Presentation',
  meta: {
    title: 'Test Presentation',
    theme: 'blue',
    target_audience: 'test',
    version: '1.0',
  },
  presenter: {
    id: 'presenter-1',
    name: 'Test Presenter',
    role: 'Speaker',
  },
  slides: [
    {
      id: 1,
      component: 'HeroSlide',
      content: {
        title: 'Test Slide',
        subtitle: 'Test Subtitle',
      },
    },
  ],
};

describe('FibonaccoPlayer', () => {
  it('renders Fibonacco player', () => {
    const { container } = render(<FibonaccoPlayer presentation={mockPresentation} />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
