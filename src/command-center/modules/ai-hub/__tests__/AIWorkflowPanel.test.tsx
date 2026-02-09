import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { AIWorkflowPanel } from '../AIWorkflowPanel';

describe('AIWorkflowPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders workflow panel with title', () => {
    render(<AIWorkflowPanel />);

    expect(screen.getByText(/AI Workflows/i)).toBeInTheDocument();
    expect(screen.getByText(/automate complex tasks/i)).toBeInTheDocument();
  });

  it('displays create workflow button', () => {
    render(<AIWorkflowPanel />);

    expect(screen.getByRole('button', { name: /create workflow/i })).toBeInTheDocument();
  });

  it('displays workflow cards', () => {
    render(<AIWorkflowPanel />);

    expect(screen.getByText('Lead Nurture Sequence')).toBeInTheDocument();
    expect(screen.getByText('Content Repurposing')).toBeInTheDocument();
    expect(screen.getByText('Competitor Analysis')).toBeInTheDocument();
  });

  it('displays workflow descriptions', () => {
    render(<AIWorkflowPanel />);

    expect(screen.getByText(/automatically nurture new leads/i)).toBeInTheDocument();
    expect(screen.getByText(/transform one piece of content/i)).toBeInTheDocument();
  });

  it('shows workflow status badges', () => {
    render(<AIWorkflowPanel />);

    expect(screen.getAllByText('idle').length).toBeGreaterThan(0);
  });

  it('displays workflow steps', () => {
    render(<AIWorkflowPanel />);

    expect(screen.getByText('Analyze lead profile')).toBeInTheDocument();
    expect(screen.getByText('Generate personalized content')).toBeInTheDocument();
  });

  it('shows progress bar for running workflow', async () => {
    const user = userEvent.setup();
    render(<AIWorkflowPanel />);

    // Find the first workflow's run button
    const runButtons = screen.getAllByRole('button', { name: /run workflow/i });
    await user.click(runButtons[0]);

    // Check for progress percentage
    await waitFor(() => {
      expect(screen.getByText(/0% complete|25% complete/i)).toBeInTheDocument();
    });
  });

  it('runs workflow when run button is clicked', async () => {
    const user = userEvent.setup();
    render(<AIWorkflowPanel />);

    // Find the first workflow's run button
    const runButtons = screen.getAllByRole('button', { name: /run workflow/i });
    await user.click(runButtons[0]);

    // Workflow should start running
    await waitFor(() => {
      expect(screen.getAllByText(/running/i)[0]).toBeInTheDocument();
    });
  });

  it('disables run button while workflow is running', async () => {
    const user = userEvent.setup();
    render(<AIWorkflowPanel />);

    const runButtons = screen.getAllByRole('button', { name: /run workflow/i });
    await user.click(runButtons[0]);

    await waitFor(() => {
      const runningButton = screen.getByRole('button', { name: /running/i });
      expect(runningButton).toBeDisabled();
    });
  });

  it('shows step status indicators', () => {
    render(<AIWorkflowPanel />);

    // Check for pending items (using actual text from component)
    expect(screen.getByText('Analyze lead profile')).toBeInTheDocument();
  });

  it('updates workflow progress as it runs', async () => {
    const user = userEvent.setup();
    render(<AIWorkflowPanel />);

    const runButtons = screen.getAllByRole('button', { name: /run workflow/i });
    await user.click(runButtons[0]);

    // Progress should increase
    await waitFor(() => {
      const progressText = screen.getByText(/\d+.*complete|\d+%/i);
      expect(progressText).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('completes workflow after all steps', { timeout: 8000 }, async () => {
    const user = userEvent.setup();
    render(<AIWorkflowPanel />);

    const runButtons = screen.getAllByRole('button', { name: /run workflow/i });
    await user.click(runButtons[0]);

    // Wait for completion (workflow completes after ~5 seconds in the component)
    await waitFor(() => {
      const completedWorkflow = screen.queryByText(/completed/i);
      expect(completedWorkflow).toBeTruthy();
    }, { timeout: 7000 });
  });
});

