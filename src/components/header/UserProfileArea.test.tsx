import { describe, it, expect } from 'vitest';
import { render } from '../../test/test-utils';
import { UserProfileArea } from './UserProfileArea';

describe('UserProfileArea', () => {
  it('renders user profile area', () => {
    const { container } = render(<UserProfileArea />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
