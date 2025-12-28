import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { Participants } from './Participants';

describe('Participants', () => {
  const mockParticipants = [
    { id: 1, name: 'John Doe', image: 'https://example.com/image.jpg' },
  ];

  it('renders participants component', () => {
    const { container } = render(<Participants participants={mockParticipants} />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
