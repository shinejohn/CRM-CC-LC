import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { Facilitator } from './Facilitator';

describe('Facilitator', () => {
  it('renders facilitator component', () => {
    const { container } = render(<Facilitator isVisible={true} isVideoOff={false} />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
