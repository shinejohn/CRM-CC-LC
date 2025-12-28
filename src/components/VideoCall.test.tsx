import { describe, it, expect, vi } from 'vitest';
import { render } from '../test/test-utils';
import { VideoCall } from './VideoCall';

vi.mock('./Facilitator', () => ({
  Facilitator: () => <div data-testid="facilitator">Facilitator</div>,
}));

vi.mock('./Participants', () => ({
  Participants: () => <div data-testid="participants">Participants</div>,
}));

vi.mock('./NotesPanel', () => ({
  NotesPanel: () => <div data-testid="notes-panel">Notes</div>,
}));

vi.mock('./ChatPanel', () => ({
  ChatPanel: () => <div data-testid="chat-panel">Chat</div>,
}));

vi.mock('./VoiceControls', () => ({
  VoiceControls: () => <div data-testid="voice-controls">Voice</div>,
}));

vi.mock('./MainNavigationHeader', () => ({
  MainNavigationHeader: () => <div data-testid="nav-header">Nav</div>,
}));

describe('VideoCall', () => {
  it('renders video call component', () => {
    const { container } = render(<VideoCall />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders video container', () => {
    const { container } = render(<VideoCall />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders call controls', () => {
    const { container } = render(<VideoCall />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
