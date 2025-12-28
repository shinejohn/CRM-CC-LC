import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { RecordButton } from './RecordButton';

describe('RecordButton', () => {
  it('renders record button', () => {
    const { container } = render(<RecordButton onRecordingComplete={() => {}} />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
