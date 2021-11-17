import * as React from 'react';
import moment from 'moment';
import { isEqual } from 'lodash';

import './Integration.scss';
import renderFeedback from '../../../apollo/feedback';
import Switch from '../../../components/Switch/Switch';
import { IconButton, Icon, IconNames, IconColor, IconSize, Loading, NavigationPrompt, NotificationType } from '../../../components';
import { Header, Content } from '../../components';
import { IconButtonType } from '../../../components/IconButton/IconButton';
import { IntegrationSettingsFlags } from '../../../apollo/types';

interface State {
  syncRecords: boolean;
  syncMessages: boolean;
  syncCalls: boolean;
}

interface Props {
  integrationTitle: string;
  integrationDescription: string;
  integrationToken: string;
  flags: {
    syncCalls: boolean,
    syncMessages: boolean,
    syncRecords: boolean,
    __typename?: string;
  };
  pollingInterval: {
    increment: number,
    unit: string
  };
  lastSuccessfulSync: number;
  isIntegrationLoading: boolean;
  saveIntegrationSettings: (variables: IntegrationSettingsFlags) => void;
}

const initialState = {
  syncRecords: false,
  syncMessages: false,
  syncCalls: false
};

export class Integration extends React.Component<Props, State> {
  state: State = initialState;

  componentDidMount() {
    const { syncCalls, syncMessages, syncRecords } = this.props.flags;
    this.setState({
      syncRecords,
      syncMessages,
      syncCalls
    })
  }

  componentDidUpdate(prevProps: Props) {
    // If new data does not match old data
    if (!isEqual(prevProps.flags, this.props.flags) || (prevProps.isIntegrationLoading && !this.props.isIntegrationLoading)) {
      const { syncCalls, syncMessages, syncRecords } = this.props.flags;
      this.setState({
        syncRecords,
        syncMessages,
        syncCalls
      });
    }
  }

  /** Handles the switch changes */
  handleFeatureSwitch = () => {
    const syncRecords = !this.state.syncRecords;
    this.setState({
      syncRecords,
      syncMessages: syncRecords,
      syncCalls: syncRecords
    });
  }

  /** Handles the messages changes */
  handleMessagesSwitch = () => {
    this.setState({ syncMessages: !this.state.syncMessages });
  }

  /** Handles the phone calls changes */
  handlePhoneCallsSwitch = () => {
    this.setState({ syncCalls: !this.state.syncCalls });
  }

  /** Handles save */
  handleSave = () => {
    const variables = {
      syncRecords: this.state.syncRecords,
      syncMessages: this.state.syncMessages,
      syncCalls: this.state.syncCalls
    }
    this.props.saveIntegrationSettings(variables);
  }

  /** Handles discard */
  handleDiscard = () => {
    this.setState({
      syncRecords: this.props.flags.syncRecords,
      syncMessages: this.props.flags.syncMessages,
      syncCalls: this.props.flags.syncCalls
    })
  }

  checkForChanges = () => {
    const { __typename, ...rest } = this.props.flags;
    return isEqual(this.state, rest);
  }

  /** Checks to see if the increment and unit of time are valid */
  checkForUnitIncrement = () => {
    const { increment, unit } = this.props.pollingInterval;
    return `Every ${increment} ${unit}`;
  }

  /** Checks to see if the last data sync is older than 72 hours */
  checkForLateDataSync = () => {
    return (moment(this.props.lastSuccessfulSync).format('MM/DD/YYYY hh:mm a'));
  }

  /** Copies the text content based off id */
  handleCopyContent = (id: string) => {
    const textToCopyElement = document.getElementById(id);
    if (textToCopyElement) {
      const textToCopy = textToCopyElement.textContent;
      const textarea = document.createElement('textarea');

      // Add textarea, set value, copy to clipboard
      document.body.appendChild(textarea);
      textarea.value = textToCopy as string;
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      renderFeedback([{
        message: 'Authorization Token copied successfully',
        type: NotificationType.SUCCESS
      }]);
    }
  }

  render() {
    const { isIntegrationLoading } = this.props;
    const syncCheck = moment(this.props.lastSuccessfulSync).isBefore(moment().subtract(72, 'hours'));
    if (isIntegrationLoading) {
      return (
        <div className="integration__loading">
          <Loading isGlobal={false} />
        </div>
      );
    }
    return (
      <Content className="integration">
        <NavigationPrompt when={!this.checkForChanges()} />
        <Header>
          <IconButton
            label="Save"
            Icon={<Icon icon={IconNames.SAVE} color={IconColor.LIGHT} />}
            onClick={this.handleSave}
            type={IconButtonType.POSITIVE}
            disabled={this.checkForChanges()}
            className="__save"
          />
          <IconButton
            label="Discard"
            Icon={<Icon icon={IconNames.CLOSE} color={IconColor.TWILIGHT} />}
            onClick={this.handleDiscard}
            type={IconButtonType.GHOST}
            disabled={this.checkForChanges()}
          />
        </Header>
        <div>
          <h3 className="__title">{this.props.integrationTitle}</h3>
          <h4 className="__subtitle">{this.props.integrationDescription}</h4>
          <h4 className="__title">Authorization Token</h4>
          <div className="__token-section">
            <h4
              className="__token-text"
              id="auth-token"
              onClick={() => this.handleCopyContent('auth-token')}
            >
              {this.props.integrationToken ? this.props.integrationToken : 'n/a'}
            </h4>
            <Icon
              icon={IconNames.CONTENT_COPY}
              className="__copy-icon"
              color={IconColor.DARK}
              size={IconSize.SMALL}
            />
          </div>
          <Switch
            checked={this.state.syncRecords}
            onChange={this.handleFeatureSwitch}
            label="Uplink Records"
          />
          <small>
            Sync schedule: {this.checkForUnitIncrement()}
            <span className={`${syncCheck ? '--urgent' : ''}`}>
              &nbsp; Last successful sync {this.checkForLateDataSync()}
            </span>
          </small>
          <div className={`__subsection ${this.state.syncRecords ? '--enabled' : '--disabled'}`}>
            <Switch
              checked={this.state.syncMessages}
              onChange={this.handleMessagesSwitch}
              label="Messages"
              subtext="Activities will be created for messages sent and received."
            />
            <Switch
              checked={this.state.syncCalls}
              onChange={this.handlePhoneCallsSwitch}
              label="Phone Calls"
              subtext="Activities will be created for calls sent and received."
            />
          </div>
        </div>
      </Content>
    )
  }
}

export default Integration;