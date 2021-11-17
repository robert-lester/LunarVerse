import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { Icon, IconNames, IconColor } from '../';

import './Notifications.scss';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFORMATION = 'information'
}

export interface Notification {
  message: string;
  type: NotificationType;
}

interface Props {
  notifications: Notification[];
}

interface State {
  notifications: Notification[];
}

export default class Notifications extends React.Component<Props, State> {
  element: HTMLElement;

  constructor(props: Props) {
    super(props);
    this.state = {
      notifications: props.notifications,
    };
    this.element = document.getElementById('notifications') as HTMLElement;
  }

  /** Removes a notification */
  handleRemoveNotification = (index: number) => {
    const { notifications } = this.state;
    if (notifications.length === 1) {
      ReactDOM.unmountComponentAtNode(this.element);
    } else {
      this.setState({
        notifications:
          this.state.notifications.filter((notification, _index) => _index !== index),
      });
    }
  }

  renderIconType = (type: string) => {
    switch (type) {
      case 'success':
        return IconNames.CHECK_CIRCLE;
      case 'error':
        return IconNames.ERROR;
      case 'warning':
        return IconNames.WARNING;
      default:
        return IconNames.INFO;
    }
  }

  render() {
    const { notifications } = this.state;
    const index = notifications.length - 1;
    const { type, message } = notifications[index];
    return (
      <Snackbar
        className="l-notifications"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={true}
        onClose={() => this.handleRemoveNotification(index)}
        autoHideDuration={6000}
      >
        <SnackbarContent
          className={`l-notifications__notification l-notifications__notification--${type}`}
          aria-describedby="client-snackbar"
          key={message}
          message={
            <div id="client-snackbar" className="l-notifications__message">
              <Icon
                className="l-notifications__icon-type"
                icon={this.renderIconType(type)}
                color={IconColor.LIGHT}
              />
              {message}
            </div>
          }
          action={
            <Icon
              key="close"
              className="l-notifications__icon"
              icon={IconNames.CLOSE}
              onClick={() => this.handleRemoveNotification(index)}
              color={IconColor.LIGHT}
            />
          }
        />
      </Snackbar>
    );
  }
}
