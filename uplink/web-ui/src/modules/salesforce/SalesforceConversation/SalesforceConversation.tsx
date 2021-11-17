import * as React from 'react';
import moment from 'moment';

import './SalesforceConversation.scss';
import { Conversation } from '../../../pages/Messages/components';
import { connect } from 'react-redux';
import { setSelectedConversationId, setMessagesDateRange } from '../../../actions';
import { DateRange } from '../../../apollo/types';
import { GlobalState } from '../../../types';

interface MapStateToProps {
  conversationId: string | null;
  finalDateRangeDate: moment.Moment | null;
}

interface MapDispatchToProps {
  setSelectedConversationId: (selectedConversationId: string | null) => void;
  setDateRange: (dateRange: DateRange) => void;
}

type Props = MapDispatchToProps & MapStateToProps;

export class SalesforceConversation extends React.Component<Props> {
  componentDidMount() {
    const { conversationId, timestamp } = this.getConversationURLParameters();
    // Set values to store
    if (conversationId && timestamp) {
      this.props.setSelectedConversationId(conversationId);
      this.props.setDateRange({ initial: null, final: moment(Number(timestamp)) });
    }
  }

  /** Gets conversation URL parameters if any exist */
  getConversationURLParameters = () => {
    const displayURL = sessionStorage.getItem('uplinkDisplayURL');
    let conversationId;
    let timestamp;
    if (displayURL && displayURL !== 'undefined') {
      const params = new URLSearchParams(displayURL.split('?')[1]);
      conversationId = params.get('cid');
      timestamp = params.get('t');
    }
    return {
      conversationId,
      timestamp
    }
  }

  render() {
    // If no conversation data is present, show messaging
    if (!this.props.conversationId || !this.props.finalDateRangeDate) {
      return (
        <div className="sf-default-message sf-uplink">
          <h3>Something went wrong, please try again.</h3>
        </div>
      );
    }
    return (
      <div className="sf-conversation">
        <Conversation />
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  conversationId: state.messages.selectedConversationId,
  finalDateRangeDate: state.messages.dateRange.final
})

export const mapDispatchToProps = {
  setSelectedConversationId: (selectedConversationId: string | null) => setSelectedConversationId(selectedConversationId),
  setDateRange: (dateRange: DateRange) => setMessagesDateRange(dateRange)
};

export default connect(mapStateToProps, mapDispatchToProps)(SalesforceConversation);