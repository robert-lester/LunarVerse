import * as React from 'react';
import { connect } from 'react-redux';

import './Messages.scss';
import ConversationList from './components/ConversationList';
import { Activity } from '../../../../../apollo/types';
import { Conversation } from '../../../../../pages/Messages/components';
import { GlobalState } from '../../../../../types';
import { Icon, Loading, IconNames } from '../../../../../components';
import { getConversationData, setConversationView } from '../../../../../actions';

interface Props {
  isSalesforce?: boolean;
}

interface MapStateToProps {
  readonly activityData: Activity | null;
  readonly conversationView: string;
  readonly isActivityDataLoading: boolean;
}

interface MapDispatchToProps {
  getConversationData: () => void;
  setConversationView: (conversationView: string) => void;
}

type ConversationListProps = MapDispatchToProps & MapStateToProps & Props;

export class Messages extends React.Component<ConversationListProps> {

  componentDidMount() {
    window.onresize = () => {
      this.checkClientWidth();
    };
    this.checkClientWidth();
  }

  componentWillUnmount() {
    // Reset view to list on exit
    this.props.setConversationView('list');
  }

  // Checks client width for the mobile modules
  checkClientWidth = () => {
    if (document.body.clientWidth > 900 && this.props.conversationView !== 'all') {
      this.props.setConversationView('all');
    } else if (document.body.clientWidth <= 900 && this.props.conversationView === 'all') {
      this.props.setConversationView('list');
    }
  }

  /** Goes back to list view */
  handleGoBack = () => {
    this.props.setConversationView('list');
  }

  render() {
    const { conversationView, isSalesforce, activityData, isActivityDataLoading } = this.props;
    const systemNumber = activityData ? activityData.systemNumber : '';
    if (isActivityDataLoading) {
      return <Loading />;
    } else if (!systemNumber) {
      return (
        <div className="sf-default-message">
          <h3>This record is not associated with Uplink. Choose "Start Conversation" to begin.</h3>
        </div>
      );
    }
    const clientWidth = document.body.clientWidth <= 900;
    const viewingList = conversationView === 'all' || conversationView === 'list' || !clientWidth;
    const viewingConversation = conversationView === 'all' || conversationView === 'conversation' || !clientWidth;
    return (
      <div className="sf-messages">
        {viewingList &&
          <ConversationList userNumber={systemNumber} />
        }
        {viewingConversation &&
          <div className="__conversations">
            <div className="__back-to-conversations">
              <Icon
                icon={IconNames.ARROW_BACK}
                className="__arrow-back"
                onClick={this.handleGoBack}
              />
              <h3>Back to Conversations</h3>
            </div>
            <div className={`__conversation-container ${isSalesforce ? '--salesforce' : ''}`}>
              <Conversation isSalesforce={isSalesforce} />
            </div>
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  conversationView: state.messages.conversationView,
  activityData: state.activity.activityData,
  isActivityDataLoading: state.activity.isActivityDataLoading
});

export const mapDispatchToProps = {
  getConversationData: () => getConversationData(),
  setConversationView: (conversationView: string) => setConversationView(conversationView)
};

export default connect(mapStateToProps, mapDispatchToProps)(Messages);
