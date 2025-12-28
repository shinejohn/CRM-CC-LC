import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { ProposalForm } from './ProposalForm';

describe('ProposalForm', () => {
  it('renders proposal form', () => {
    const { container } = render(<ProposalForm />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays project scope section', () => {
    const { container } = render(<ProposalForm />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
