import { describe, it, expect } from 'vitest';
import { render } from '../../../test/test-utils';
import { TrainingOverview } from './TrainingOverview';

describe('TrainingOverview', () => {
  it('renders training overview', () => {
    const { container } = render(<TrainingOverview />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
