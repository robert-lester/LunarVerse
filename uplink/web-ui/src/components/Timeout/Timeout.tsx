import * as React from 'react';

import { Button, Modal, ModalActions, ModalContent, ButtonType } from '../';
import './Timeout.scss';

interface Props {
  onToggle: () => void;
  onLogout: () => void;
  performActivity: () => void;
  refreshToken: () => void;
}

interface State {
  timer: number;
}

export default class Timeout extends React.Component<Props, State> {
  state = {
    timer: 60,
  };
  timerInterval!: number;

  componentDidMount() {
    this.timerInterval = window.setInterval(this.updateTimer, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerInterval);
    this.timerInterval = 0;
  }

  /** Hides the timeout and updates the user activity */
  handleContinue = () => {
    this.props.onToggle();
    this.props.performActivity();
    this.props.refreshToken();
  }

  /** Counts down the timer */
  updateTimer = () => {
    this.setState({ timer: this.state.timer - 1 }, () => {
      // If the timer reaches 0
      if (!this.state.timer) {
        this.props.onLogout();
      }
    });
  }

  render() {
    return (
      <Modal
        title="Uplink Session Timeout"
        isOpen={true}
      >
        <ModalContent>
          For security reasons, you will be signed out of your Uplink session in {this.state.timer} seconds due to timeout.
          If you are still working, click below to continue.
        </ModalContent>
        <ModalActions>
          <Button
            label="Sign Out"
            onClick={this.props.onLogout}
            appearance={ButtonType.SECONDARY}
          />
          <Button
            label="Continue Working"
            onClick={this.handleContinue}
          />
        </ModalActions>
      </Modal>
    );
  }
}
