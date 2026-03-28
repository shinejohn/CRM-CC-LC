import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { ExpandableChat } from './ExpandableChat';

describe('ExpandableChat', () => {
  it('renders without crashing', () => {
    // @ts-ignore
    render(<ExpandableChat messages={[]} addMessage={() => {}} />);
  });
});
