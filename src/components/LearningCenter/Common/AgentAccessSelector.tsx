import React from 'react';
import { Bot } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  type: string;
}

interface AgentAccessSelectorProps {
  agents: Agent[];
  selectedAgents: string[];
  onChange: (agentIds: string[]) => void;
  allowAll?: boolean;
  className?: string;
}

export const AgentAccessSelector: React.FC<AgentAccessSelectorProps> = ({
  agents,
  selectedAgents,
  onChange,
  allowAll = true,
  className = '',
}) => {
  const allSelected = allowAll && selectedAgents.length === 0;
  const specificSelected = !allowAll && selectedAgents.length > 0;

  const handleAllToggle = () => {
    if (allSelected) {
      // Switch to specific agents (select all)
      onChange(agents.map((a) => a.id));
    } else {
      // Switch to all agents
      onChange([]);
    }
  };

  const handleAgentToggle = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      onChange(selectedAgents.filter((id) => id !== agentId));
    } else {
      onChange([...selectedAgents, agentId]);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-medium text-gray-700">AI Agent Access</div>
      
      {allowAll && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="agent-access"
            checked={allSelected}
            onChange={handleAllToggle}
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">All agents can access</span>
        </label>
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="agent-access"
          checked={specificSelected || (!allowAll && selectedAgents.length > 0)}
          onChange={() => {
            if (allSelected) {
              onChange(agents.map((a) => a.id));
            }
          }}
          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700">Specific agents only:</span>
      </label>

      <div className="ml-6 space-y-2">
        {agents.map((agent) => (
          <label
            key={agent.id}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
          >
            <input
              type="checkbox"
              checked={selectedAgents.includes(agent.id)}
              onChange={() => handleAgentToggle(agent.id)}
              disabled={allSelected}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
            />
            <Bot size={16} className="text-indigo-600" />
            <span className="text-sm text-gray-700">{agent.name}</span>
            <span className="text-xs text-gray-500">({agent.type})</span>
          </label>
        ))}
      </div>
    </div>
  );
};


