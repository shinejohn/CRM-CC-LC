import { describe, it, expect } from 'vitest';
import { render } from '../../../test/test-utils';
import { EmbeddingIndicator } from './EmbeddingIndicator';

describe('EmbeddingIndicator', () => {
  it('renders embedding indicator component', () => {
    const { container } = render(<EmbeddingIndicator status="completed" />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with completed status', () => {
    const { container } = render(<EmbeddingIndicator status="completed" />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with pending status', () => {
    const { container } = render(<EmbeddingIndicator status="pending" />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with processing status', () => {
    const { container } = render(<EmbeddingIndicator status="processing" />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with failed status', () => {
    const { container } = render(<EmbeddingIndicator status="failed" />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
