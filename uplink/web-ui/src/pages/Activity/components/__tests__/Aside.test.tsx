import * as React from 'react';
import * as enzyme from 'enzyme';
import moment from 'moment';

import { Aside } from '../Aside';
import { MessageType } from '../../../../types';

describe('Aside', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Aside
        selectedUserNumbers={[]}
        userNumbers={[]}
        dateRange={{
          initial: moment().startOf('month'),
          final: moment().endOf('month')
        }}
        messageType={MessageType.INBOUND}
        clearSelectedUserNumbers={fn}
        setDateRange={fn}
        setMessageType={fn}
        setSelectedNumber={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
