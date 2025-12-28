import { describe, it, expect } from 'vitest';
import { render } from '../../../test/test-utils';
import { FibonaccoPlayer } from './FibonaccoPlayer';

describe('FibonaccoPlayer', () => {
  it('renders Fibonacco player', () => {
    const { container } = render(<FibonaccoPlayer presentationId="test-123" />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
