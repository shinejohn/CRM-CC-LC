import { describe, it, expect } from 'vitest';
import { render } from '../../test/test-utils';
import { AccountManagerButton } from './AccountManagerButton';

describe('AccountManagerButton', () => {
  it('renders account manager button', () => {
    const { container } = render(<AccountManagerButton />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
