import { describe, it, expect } from 'vitest';
import { render } from '../../../test/test-utils';
import { ProfileSurveyBuilder } from './ProfileSurveyBuilder';

describe('ProfileSurveyBuilder', () => {
  it('renders profile survey builder', () => {
    const { container } = render(<ProfileSurveyBuilder />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
