import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Notifications } from '../components';
import { Notification } from '../components/Notifications/Notifications';

const renderFeedback = (notifications: Notification[]) => {
  const element = document.getElementById('notifications');
  if (element) {
    ReactDOM.render(<Notifications notifications={notifications} />, element);
  }
};

export default renderFeedback;
