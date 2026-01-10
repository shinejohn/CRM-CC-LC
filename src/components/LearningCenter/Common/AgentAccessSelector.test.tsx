import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { AgentAccessSelector } from './AgentAccessSelector';

const mockAgents = [
  { id: 'agent1', name: 'Agent 1', type: 'assistant' },
  { id: 'agent2', name: 'Agent 2', type: 'assistant' },
];

describe('AgentAccessSelector', () => {
  it('renders agent access selector', () => {
    const { container } = render(
      <AgentAccessSelector
        agents={mockAgents}
        selectedAgents={[]}
        onChange={() => {}}
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays selected agents', () => {
    const { container } = render(
      <AgentAccessSelector
        agents={mockAgents}
        selectedAgents={['agent1', 'agent2']}
        onChange={() => {}}
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
