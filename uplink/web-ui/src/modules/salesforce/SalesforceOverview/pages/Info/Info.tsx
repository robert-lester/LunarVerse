import * as React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';

import './Info.scss';
import Logo from '../../../../../img/Logo';
import { Label, Button, Loading } from '../../../../../components';
import { Activity, User } from '../../../../../apollo/types';
import { GlobalState } from '../../../../../types';
import { getUserData, startConversation } from '../../../../../actions';
import { formatSearchNumber } from '../../../../../utils';

interface MapStateToProps {
  readonly activityData: Activity | null;
  readonly userData: User | null;
  readonly isUserDataLoading: boolean;
  readonly isActivityDataLoading: boolean;
  readonly isStartConversationLoading: boolean;
  readonly systemNumber: string;
}

interface MapDispatchToProps {
  getUserData: () => void;
  startConversation: () => void;
}

type InfoProps = MapStateToProps & MapDispatchToProps;

export class Info extends React.Component<InfoProps> {
  componentDidMount() {
    this.props.getUserData();
  }

  /** Compares the session storage number with the returned number */
  compareContactNumbers = (): boolean => {
    const { activityData } = this.props;
    if (formatSearchNumber(activityData!.systemNumber) === sessionStorage.getItem('uplinkContactPhoneNumber')) {
      return true;
    }
    return false;
  }

  render() {
    const { userData, activityData, isActivityDataLoading, isUserDataLoading, systemNumber } = this.props;
    if (isUserDataLoading || isActivityDataLoading) {
      return (
        <div className="sf-info__loading">
          <Loading isGlobal={false} />
        </div>
      );
    }
    const displayedSystemNumber = activityData && activityData.systemNumber || systemNumber;
    return (
      <div className="sf-info">
        <div className="sf-info__logo">
          {Logo()}
        </div>
        <div className="sf-info__row">
          <div className="sf-info__column">
            Assigned Number
              {
              displayedSystemNumber
                ? <a target="_top" href={`tel:${displayedSystemNumber}`} className="sf-info__assigned-number">
                  <Label label={displayedSystemNumber as string} />
                </a>
                : <Label label="N/A" />
            }
          </div>
          <div>
            <Button
              className="sf-info__button"
              label="Start Conversation"
              onClick={this.props.startConversation}
              isLoading={this.props.isStartConversationLoading}
              disabled={!userData || !!(activityData && activityData.isUser)}
            />
          </div>
        </div>
        <h3 className="sf-info__divider">Activity</h3>
        <div className="sf-info__row">
          <div className="sf-info__column">
            First Inbound Message
              <Label label={activityData && activityData.firstInBound ? moment(activityData.firstInBound).format('MM/DD/YYYY h:mm A') : 'N/A'} />
          </div>
          <div className="sf-info__column">
            First Outbound Message
              <Label label={activityData && activityData.firstOutBound ? moment(activityData.firstOutBound).format('MM/DD/YYYY h:mm A') : 'N/A'} />
          </div>
        </div>
        <div className="sf-info__row">
          <div className="sf-info__column">
            Last Inbound Message
              <Label label={activityData && activityData.lastInBound ? moment(activityData.lastInBound).format('MM/DD/YYYY h:mm A') : 'N/A'} />
          </div>
          <div className="sf-info__column">
            Last Outbound Message
              <Label label={activityData && activityData.lastOutBound ? moment(activityData.lastOutBound).format('MM/DD/YYYY h:mm A') : 'N/A'} />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  activityData: state.activity.activityData,
  isActivityDataLoading: state.activity.isActivityDataLoading,
  isStartConversationLoading: state.sfModules.isStartConversationLoading,
  userData: state.user.userData,
  isUserDataLoading: state.user.isUserDataLoading,
  systemNumber: state.sfModules.systemNumber
});

export const mapDispatchToProps = {
  getUserData: () => getUserData(),
  startConversation: () => startConversation()
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Info);