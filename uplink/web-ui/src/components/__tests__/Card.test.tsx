import * as React from 'react';
import * as enzyme from 'enzyme';

import Card from '../Card/Card';

describe('Card', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <Card>
      </Card>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
