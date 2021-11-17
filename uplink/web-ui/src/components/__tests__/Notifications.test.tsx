import * as React from 'react';
import * as enzyme from 'enzyme';

import Notifications, { NotificationType } from '../Notifications/Notifications';
import { IconNames } from '../Icon/Icon';

describe('Notifications', () => {
  let wrapper: enzyme.ShallowWrapper;
  let instance: Notifications;
  const notifications = [
    {
      message: 'Test',
      type: NotificationType.SUCCESS
    }
  ];
  beforeEach(() => {
    const component = (
      <Notifications notifications={notifications}/>
    );
    wrapper = enzyme.shallow(component);
    instance = wrapper.instance() as Notifications;
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it(`should return icon type of ${IconNames.CHECK_CIRCLE}`, () => {
    expect(instance.renderIconType('success')).toEqual(IconNames.CHECK_CIRCLE);
  });

  it(`should return icon type of ${IconNames.ERROR}`, () => {
    expect(instance.renderIconType('error')).toEqual(IconNames.ERROR);
  });

  it(`should return icon type of ${IconNames.WARNING}`, () => {
    expect(instance.renderIconType('warning')).toEqual(IconNames.WARNING);
  });

  it(`should return icon type of ${IconNames.INFO}`, () => {
    expect(instance.renderIconType('')).toEqual(IconNames.INFO);
  });
});
