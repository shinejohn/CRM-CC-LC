import { describe, it, expect, vi } from 'vitest';
import { render } from '../test/test-utils';
import { ProfilePage } from './ProfilePage';

vi.mock('../components/NavigationMenu', () => ({
  NavigationMenu: () => <div data-testid="nav-menu">Nav</div>,
}));

vi.mock('../components/FileExplorer', () => ({
  FileExplorer: () => <div data-testid="file-explorer">Files</div>,
}));

describe('ProfilePage', () => {
  it('renders profile page', () => {
    const { container } = render(<ProfilePage />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays user information section', () => {
    const { container } = render(<ProfilePage />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays business information section', () => {
    const { container } = render(<ProfilePage />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
