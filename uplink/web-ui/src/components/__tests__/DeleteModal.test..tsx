import * as React from 'react';
import * as enzyme from 'enzyme';

import DeleteModal from '../DeleteModal/DeleteModal';

describe('DeleteModal', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <DeleteModal
        onDelete={fn}
        onToggle={fn}
        type="Test"
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
