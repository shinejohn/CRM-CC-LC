import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { NotesPanel } from './NotesPanel';

describe('NotesPanel', () => {
  const mockNotes = [
    { category: 'Action Items', items: ['Task 1', 'Task 2'] },
  ];

  it('renders notes panel', () => {
    const { container } = render(<NotesPanel notes={mockNotes} />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
