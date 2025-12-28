import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { LearnSearchBar } from './LearnSearchBar';

describe('LearnSearchBar', () => {
  it('renders learn search bar', () => {
    render(<LearnSearchBar />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();
  });
});
