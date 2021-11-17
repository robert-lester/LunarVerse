import * as React from 'react';
import { connect } from 'react-redux';

import { Activity } from '../../../apollo/types';
import { GlobalState } from '../../../types';
import { Loading } from '../../../components';
import { compareContactNumbers } from '../../../utils';
import { getActivityData } from '../../../actions';

interface Props {
  children: React.ReactNode;
}

interface MapStateToProps {
  readonly activityData: Activity | null;
  readonly isActivityDataLoading: boolean;
}

interface MapDispatchToProps {
  getActivityData: () => void;
}

type ModulePhoneNumberCheckProps = MapDispatchToProps & MapStateToProps & Props;

export class ModulePhoneNumberCheck extends React.Component<ModulePhoneNumberCheckProps> {
  render() {
    const { activityData, children, isActivityDataLoading } = this.props;
    if (isActivityDataLoading) {
      return <Loading />;
    }
    // Mobile number matches an Uplink User
    if (activityData && activityData.isUser) {
      return (
        <div className="sf-default-message">
          <h3>You cannot send a message to an Uplink user. Please verify the "Mobile" field to begin using Uplink for this record.</h3>
        </div>
      );
    }
    // Mobile number matches Contact Number for org
    if (activityData && activityData.systemNumber && compareContactNumbers(activityData)) {
      return (
        <div className="sf-default-message">
          <h3>Please update the "Mobile" field to {activityData.physicalNumber} to begin using Uplink for this record.</h3>
        </div>
      );
    }
    return children;
  }
}

const mapStateToProps = (state: GlobalState) => ({
  activityData: state.activity.activityData,
  isActivityDataLoading: state.activity.isActivityDataLoading
});

export const mapDispatchToProps = {
  getActivityData: () => getActivityData()
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModulePhoneNumberCheck);