import * as React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { isEqual } from 'lodash';

import './Plan.scss';
import renderFeedback from '../../../apollo/feedback';
import Switch from '../../../components/Switch/Switch';
import { Icon, IconButton, IconColor, IconNames, IconSize, Loading, NavigationPrompt, NotificationType } from '../../../components';
import { IconButtonType } from '../../../components/IconButton/IconButton';
import { PlanData } from '../../../apollo/types';
import { ThunkDispatcher, GlobalState } from '../../../types';
import { getPlanData } from '../../../actions/plan';
import { Header, Content } from '../../components';

interface MapDispatchToProps {
  getPlanData: () => void;
}

interface MapStateToProps {
  readonly plan: PlanData | null;
  readonly isPlanDataLoading: boolean;
}

interface State {
  syncMobile: boolean;
}

const initialState = {
  syncMobile: false
};

type PlanType = MapStateToProps & MapDispatchToProps & State;

export class Plan extends React.Component<PlanType> {
  state: State = initialState;

  dataSets = {
    smsMessages: 'SMS Messages',
    mediaMessages: 'Media Messages',
    voiceMinutes: 'Minutes'
  };

  componentDidMount() {
    this.props.getPlanData();
  }

  /** Renders a single data set row */
  renderDataSet = (key: string) => {
    const { plan } = this.props;
    return (
      <div className="__row" key={key}>
        <h3>{this.dataSets[key]}</h3>
        <div className="__data">
          <span>Used</span>
          <span>{plan ? plan!.usage[key] : '-'}</span>
        </div>
      </div>
    );
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
        message: id === 'uplink-org-slug'
          ? 'Uplink Organization copied successfully'
          : 'Uplink Authorization Token copied successfully',
        type: NotificationType.SUCCESS
      }]);
    }
  }

  /** Gets usage range */
  getUsageRange = () => {
    const { plan } = this.props;
    let startDate = 'No Date';
    let endDate = 'No Date';
    let usageRange = 'Unknown';
    if (plan && plan.usageCycle) {
      if (plan.usageCycle.startDate) {
        startDate = moment(plan.usageCycle.startDate).format('MM/DD/YYYY');
      }
      if (plan.usageCycle.endDate) {
        endDate = moment(plan.usageCycle.endDate).format('MM/DD/YYYY');
      }
      usageRange = startDate + ' - ' + endDate;
    }
    return usageRange;
  }

  /** Handles the mobile sync changes */
  handleMobileSyncSwitch = () => {
    this.setState({ syncMobile: !this.state.syncMobile });
  }

  /** Handles save */
  handleSave = () => {
    const variables = {
      syncMobile: this.state.syncMobile
    }
    console.log(variables);
  }

  /** Handles discard */
  handleDiscard = () => {
    this.setState({
      syncMobile: this.state.syncMobile
    })
  }

  checkForChanges = () => {
    return isEqual(this.state.syncMobile, false);
  }

  render() {
    const { plan, isPlanDataLoading } = this.props;
    if (isPlanDataLoading) {
      return (
        <div className="plan__loading">
          <Loading isGlobal={false} />
        </div>
      );
    }
    return (
      <Content className={`${localStorage.sendMessagesUI ? 'plan addPadding' : 'plan'}`} isPushedDown={false}>
        {localStorage.sendMessagesUI &&
          <>
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
          </>
        }
        <div className="__row __user-row">
          <div>
            <h3>User Numbers</h3>
            <h1>{plan ? plan.numbers.included : '-'}</h1>
            <span className="__name"></span>
          </div>
        </div>
        <div className="__row">
          <h3>Usage for Date Range</h3>
          <div className="__data">
            {this.getUsageRange()}
          </div>
        </div>
        {Object.keys(this.dataSets).map(this.renderDataSet)}
        <div className="__row">
          <h3>Uplink Information</h3>
          <div className="__data">
            <span>Uplink Organization</span>
            <div
              className="__sf-info"
              onClick={() => this.handleCopyContent('uplink-org-slug')}
            >
              <span id="uplink-org-slug">{sessionStorage.getItem('uplinkOrgSlug')}</span>
              <Icon
                icon={IconNames.CONTENT_COPY}
                className="__copy-icon"
                color={IconColor.DARK}
                size={IconSize.SMALL}
              />
            </div>
          </div>
        </div>
        {localStorage.sendMessagesUI &&
          <div className="__row">
            <div className="__data">
              <Switch
                checked={this.state.syncMobile}
                onChange={this.handleMobileSyncSwitch}
                label="Mobile Sync"
                subtext="Text Messages sent from the Web Conversation Viewer will be sent to your phone"
              />
            </div>
          </div>
        }
      </Content>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  plan: state.plan.payload,
  isPlanDataLoading: state.plan.isGetPlanDataLoading
});

const mapDispatchToProps = (dispatch: ThunkDispatcher) => ({
  getPlanData: () => dispatch(getPlanData())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Plan);
