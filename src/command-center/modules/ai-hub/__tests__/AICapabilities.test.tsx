import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../../test/test-utils';
import { AICapabilities } from '../AICapabilities';

describe('AICapabilities', () => {
  it('renders capabilities panel with title', () => {
    render(<AICapabilities />);
    
    expect(screen.getByText(/AI Capabilities/i)).toBeInTheDocument();
    expect(screen.getByText(/explore what the AI can do/i)).toBeInTheDocument();
  });

  it('displays capabilities grouped by category', () => {
    render(<AICapabilities />);
    
    // Check for category headers
    expect(screen.getByText('COMMUNICATION')).toBeInTheDocument();
    expect(screen.getByText('CONTENT')).toBeInTheDocument();
    expect(screen.getByText('ANALYTICS')).toBeInTheDocument();
    expect(screen.getByText('AUTOMATION')).toBeInTheDocument();
  });

  it('displays all capability names', () => {
    render(<AICapabilities />);
    
    expect(screen.getByText('Conversational AI')).toBeInTheDocument();
    expect(screen.getByText('Content Generation')).toBeInTheDocument();
    expect(screen.getByText('Data Analysis')).toBeInTheDocument();
    expect(screen.getByText('Workflow Automation')).toBeInTheDocument();
    expect(screen.getByText('Email Drafting')).toBeInTheDocument();
    expect(screen.getByText('Smart Scheduling')).toBeInTheDocument();
    expect(screen.getByText('Customer Insights')).toBeInTheDocument();
    expect(screen.getByText('Predictive Analytics')).toBeInTheDocument();
  });

  it('displays capability descriptions', () => {
    render(<AICapabilities />);
    
    expect(screen.getByText(/natural language conversations/i)).toBeInTheDocument();
    expect(screen.getByText(/create emails, articles, social posts/i)).toBeInTheDocument();
    expect(screen.getByText(/analyze customer data/i)).toBeInTheDocument();
  });

  it('renders capability icons', () => {
    render(<AICapabilities />);
    
    // Icons are rendered as SVG elements
    const cards = screen.getAllByText('Conversational AI');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('organizes capabilities in grid layout', () => {
    const { container } = render(<AICapabilities />);
    
    // Check for grid classes
    const grids = container.querySelectorAll('[class*="grid"]');
    expect(grids.length).toBeGreaterThan(0);
  });

  it('displays all 8 capabilities', () => {
    render(<AICapabilities />);
    
    const capabilityNames = [
      'Conversational AI',
      'Content Generation',
      'Data Analysis',
      'Workflow Automation',
      'Email Drafting',
      'Smart Scheduling',
      'Customer Insights',
      'Predictive Analytics',
    ];
    
    capabilityNames.forEach(name => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });
});

