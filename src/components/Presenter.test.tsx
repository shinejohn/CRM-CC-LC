import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { Presenter } from './Presenter';

describe('Presenter', () => {
  it('renders presenter component', () => {
    const { container } = render(<Presenter />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
