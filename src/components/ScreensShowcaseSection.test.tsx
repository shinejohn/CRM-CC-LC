import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { ScreensShowcaseSection } from './ScreensShowcaseSection';

describe('ScreensShowcaseSection', () => {
  it('renders screens showcase section', () => {
    const { container } = render(<ScreensShowcaseSection />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
