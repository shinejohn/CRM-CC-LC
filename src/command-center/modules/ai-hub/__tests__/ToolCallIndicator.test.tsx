import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../../test/test-utils';
import { ToolCallIndicator } from '../ToolCallIndicator';
import { ToolCall } from '@/types/command-center';

describe('ToolCallIndicator', () => {
  const mockToolCall: ToolCall & { status?: 'pending' | 'running' | 'completed' | 'error' } = {
    id: 'tc-1',
    name: 'search',
    arguments: { query: 'test query' },
    status: 'running',
  };

  it('renders tool call name', () => {
    render(<ToolCallIndicator toolCall={mockToolCall} />);
    
    expect(screen.getByText('search')).toBeInTheDocument();
  });

  it('displays tool call status badge', () => {
    render(<ToolCallIndicator toolCall={mockToolCall} />);
    
    expect(screen.getByText('running')).toBeInTheDocument();
  });

  it('shows tool call arguments when present', () => {
    render(<ToolCallIndicator toolCall={mockToolCall} />);
    
    expect(screen.getByText(/test query/i)).toBeInTheDocument();
  });

  it('handles pending status', () => {
    const pendingToolCall = { ...mockToolCall, status: 'pending' as const };
    render(<ToolCallIndicator toolCall={pendingToolCall} />);
    
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('handles completed status', () => {
    const completedToolCall = { ...mockToolCall, status: 'completed' as const };
    render(<ToolCallIndicator toolCall={completedToolCall} />);
    
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('handles error status', () => {
    const errorToolCall = { ...mockToolCall, status: 'error' as const };
    render(<ToolCallIndicator toolCall={errorToolCall} />);
    
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('defaults to pending when status is not provided', () => {
    const noStatusToolCall = { ...mockToolCall };
    delete noStatusToolCall.status;
    render(<ToolCallIndicator toolCall={noStatusToolCall} />);
    
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('handles empty arguments', () => {
    const emptyArgsToolCall = {
      ...mockToolCall,
      arguments: {},
      status: 'completed' as const,
    };
    render(<ToolCallIndicator toolCall={emptyArgsToolCall} />);
    
    expect(screen.getByText('search')).toBeInTheDocument();
  });
});

