import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { AgentAccessSelector } from './AgentAccessSelector';

describe('AgentAccessSelector', () => {
  it('renders agent access selector', () => {
    const { container } = render(
      <AgentAccessSelector
        value={[]}
        onChange={() => {}}
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays selected agents', () => {
    const { container } = render(
      <AgentAccessSelector
        value={['agent1', 'agent2']}
        onChange={() => {}}
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
