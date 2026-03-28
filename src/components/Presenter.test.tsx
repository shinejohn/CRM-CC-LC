import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { Presenter } from './Presenter';

describe('Presenter', () => {
  it('renders without crashing', () => {
    // @ts-ignore
    render(<Presenter isVideoOff={false} />);
  });
});
