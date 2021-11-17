import * as React from 'react';
import * as enzyme from 'enzyme';

import { ListItem } from '../ListItem/ListItem';

describe('ListItem', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <ListItem>
        Test
      </ListItem>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
