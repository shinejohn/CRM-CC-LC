import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { TranscriptDownloadButton } from './TranscriptDownloadButton';

describe('TranscriptDownloadButton', () => {
  it('renders transcript download button', () => {
    const { container } = render(<TranscriptDownloadButton sessionId="test-123" />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
