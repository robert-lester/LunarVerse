import * as React from 'react';
import * as enzyme from 'enzyme';

import PopoverActions from '../PopoverActions/PopoverActions';
import { Icon, IconNames, IconColor, IconSize } from '../Icon/Icon';
import { ListIconColor } from '../ListIcon/ListIcon';
import { AssignNumbersMessaging } from '../../constants/messaging';

describe('PopoverActions', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  const config = {
    defaultView: 'assign',
    views: {
      assign: {
        title: 'Edit Assignment',
        actions: [
          {
            iconName: IconNames.REMOVE,
            label: 'Unassign Number',
            color: ListIconColor.ERROR,
            onClick: fn
          },
          {
            iconName: IconNames.PHONE_FORWARDED,
            label: 'Forward Number',
            color: ListIconColor.SECONDARY,
            onClick: fn
          }
        ],
        list: [],
        emptyListMessage: AssignNumbersMessaging.NO_UNASSIGNED_USERS
      },
      forwardNumber: {
        title: 'Forward Number',
        list: [],
        emptyListMessage: AssignNumbersMessaging.NO_NUMBERS_TO_FORWARD
      },
    }
  };
  beforeEach(() => {
    const component = (
      <PopoverActions
        config={config}
        currentView={'assign'}
        open={true}
        anchorEl={null}
        onBack={fn}
        onClose={fn}
        clickElement={
          <div className="assign-numbers-assignment__empty-connection" onClick={fn}>
            <Icon
              icon={IconNames.ADD}
              color={IconColor.TWILIGHT}
              size={IconSize.SMALL}
              aria-haspopup="true"
              aria-owns={open ? 'simple-popper' : undefined}
            />
          </div>}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
