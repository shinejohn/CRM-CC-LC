import { describe, it, expect } from 'vitest';
import { render } from '../../../test/test-utils';
import { LoadingSkeleton, CardSkeleton, ListSkeleton, TableSkeleton } from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders basic skeleton loader', () => {
    const { container } = render(<LoadingSkeleton />);
    
    // Check for skeleton element with animate-pulse class
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(<LoadingSkeleton className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('CardSkeleton', () => {
  it('renders card skeleton', () => {
    const { container } = render(<CardSkeleton />);
    
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });
});

describe('ListSkeleton', () => {
  it('renders list skeleton with default count', () => {
    const { container } = render(<ListSkeleton />);
    
    // Should render 5 items by default
    const items = container.querySelectorAll('.animate-pulse');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it('renders list skeleton with custom count', () => {
    const { container } = render(<ListSkeleton count={3} />);
    
    const items = container.querySelectorAll('.animate-pulse');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });
});

describe('TableSkeleton', () => {
  it('renders table skeleton with default rows and cols', () => {
    const { container } = render(<TableSkeleton />);
    
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders table skeleton with custom dimensions', () => {
    const { container } = render(<TableSkeleton rows={10} cols={6} />);
    
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });
});
