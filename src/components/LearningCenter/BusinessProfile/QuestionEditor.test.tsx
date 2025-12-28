import { describe, it, expect } from 'vitest';
import { render } from '../../../test/test-utils';
import { QuestionEditor } from './QuestionEditor';

describe('QuestionEditor', () => {
  it('renders question editor', () => {
    const { container } = render(<QuestionEditor onClose={() => {}} onSave={() => {}} />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
