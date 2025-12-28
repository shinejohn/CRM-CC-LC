import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { VoiceControls } from './VoiceControls';

describe('VoiceControls', () => {
  it('renders voice controls', () => {
    const { container } = render(
      <VoiceControls
        isListening={false}
        setIsListening={() => {}}
        onTranscriptUpdate={() => {}}
        transcript=""
        setTranscript={() => {}}
        addMessage={() => {}}
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
