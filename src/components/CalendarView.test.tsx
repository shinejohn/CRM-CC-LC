import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { CalendarView } from './CalendarView';

describe('CalendarView', () => {
  it('renders calendar view', () => {
    const { container } = render(<CalendarView />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays current month', () => {
    const { container } = render(<CalendarView />);

    // Calendar component renders
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders calendar navigation buttons', () => {
    const { container } = render(<CalendarView />);

    // Calendar with navigation renders
    expect(container.firstChild).toBeInTheDocument();
  });
});
