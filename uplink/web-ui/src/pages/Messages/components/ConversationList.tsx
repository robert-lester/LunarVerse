import * as React from 'react';
import { connect } from 'react-redux';

import './ConversationList.scss';
import {
  DateRange,
  ConversationData,
  UserNumberType
} from '../../../apollo/types';
import {
  Icon,
  IconNames,
  Loading,
  IconColor,
  Button,
  Search,
  ConversationListItem,
  IconButton
} from '../../../components';
import { Sort, GlobalState } from '../../../types';
import { sortDateAscending, sortDateDescending, formatSearchNumber } from '../../../utils';
import {
  setSortType,
  setSelectedConversationId,
  getConversationsData,
  clearMessagesSelectedNumber
} from '../../../actions';
import { ContactNumberType } from '../../../reducers';
import { IconButtonType } from '../../../components/IconButton/IconButton';

interface MapStateToProps {
  readonly conversationsData: ConversationData[];
  readonly dateRange: DateRange;
  readonly isConversationsDataLoading: boolean;
  readonly selectedContactNumberType: ContactNumberType;
  readonly selectedConversationId: string | null;
  readonly selectedUserNumbers: string[];
  readonly sort: Sort;
}

interface MapDispatchToProps {
  clearSelectedUserNumbers: () => void;
  getConversations: () => void;
  setSelectedConversationId: (selectedConversationId: string | null) => void;
  setSortType: (sort: Sort) => void;
}

interface State {
  search: string;
}

type ConversationListProps = MapDispatchToProps & MapStateToProps;

export class ConversationList extends React.Component<ConversationListProps, State> {
  state: State = {
    search: '',
  };

  componentDidMount() {
    this.props.getConversations();
  }

  componentDidUpdate(prevProps: ConversationListProps) {
    if (prevProps.selectedUserNumbers !== this.props.selectedUserNumbers || prevProps.dateRange !== this.props.dateRange) {
      this.props.getConversations();
    }
  }

  componentWillUnmount() {
    this.props.clearSelectedUserNumbers();
  }

  /** Handles search changes */
  handleSearchChange = ({ target: { value: search } }: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ search });
  }

  /** Refetches the conversation list */
  handleRefresh = () => {
    this.props.getConversations();
  }

  /** Handles sorting change */
  handleChangeSort = () => {
    this.props.setSortType(this.props.sort === Sort.ASC ? Sort.DESC : Sort.ASC);
  }

  /** Filters the list of conversations by contact numbers */
  filterNumberList = ({ phoneNumbers }: ConversationData) => {
    const contact = phoneNumbers.find(phoneNumber => phoneNumber.type === UserNumberType.CONTACT || phoneNumber.type === UserNumberType.FORWARD);
    const { selectedContactNumberType } = this.props;
    let contactNumber = '';
    if (contact) {
      if (selectedContactNumberType === ContactNumberType.REAL && contact.user) {
        contactNumber = contact.user.physicalNumber;
      } else if (selectedContactNumberType === ContactNumberType.UPLINK) {
        contactNumber = contact.systemNumber;
      }
    }
    return formatSearchNumber(contactNumber).includes(formatSearchNumber(this.state.search));
  }

  /** Renders a single conversation list item */
  renderConversation = ({ updated_at, phoneNumbers, public_id }: ConversationData) => {
    const userNumber = phoneNumbers.find(phoneNumber => phoneNumber.type !== UserNumberType.CONTACT);
    const contactNumber = phoneNumbers.find(phoneNumber => phoneNumber.type === UserNumberType.CONTACT);
    return (
      <ConversationListItem
        isSelected={this.props.selectedConversationId === public_id}
        updatedAt={updated_at}
        userNumber={userNumber}
        contactNumber={contactNumber}
        isContactVisible={true}
        contactDisplay={this.props.selectedContactNumberType}
        onClick={() => this.props.setSelectedConversationId(public_id)}
        key={public_id}
      />
    );
  }

  /** Gets a message based on whether no conversations exist or none
   * exist to show based on selected user numbers
   */
  getConversationsListMessage = () => {
    return this.props.selectedUserNumbers.length
      ? 'No conversations exist for the selected user numbers.'
      : 'No conversations exist.';
  }

  /** Sorts conversations based on last updated at date */
  getSortedConversations = () => {
    const utilities = {
      sortDateAscending,
      sortDateDescending,
    };
    const sortUtility = this.props.sort === Sort.ASC ? 'sortDateDescending' : 'sortDateAscending';
    const mutableConversations = [...this.props.conversationsData];
    return mutableConversations.sort((a, b) => utilities[sortUtility](a, b, 'updated_at'));
  };

  /** Renders conversations */
  renderConversations = () => {
    // Sort conversations by prop
    const sortedConversations = this.getSortedConversations();
    const conversations = sortedConversations.filter(this.filterNumberList).map(this.renderConversation);
    // Render conversations or show message if none to show
    return conversations && conversations.length ? (
      conversations
    ) : (
        <div className="__empty-message">{this.getConversationsListMessage()}</div>
      );
  }

  render() {
    const { isConversationsDataLoading } = this.props;
    const sortIcon = this.props.sort === Sort.ASC ? IconNames.ARROW_UPWARD : IconNames.ARROW_DOWNWARD;
    return (
      <div className="messages-conversation-list">
        <div className="__actions">
          <Search
            className="__search"
            search={formatSearchNumber(this.state.search)}
            onChange={this.handleSearchChange}
            placeholder="Search by contact number"
          />
          <IconButton
            Icon={<Icon icon={sortIcon} color={IconColor.LIGHT} />}
            label="Sort"
            type={IconButtonType.ACTION}
            onClick={this.handleChangeSort}
          />
        </div>
        {isConversationsDataLoading
          ? <Loading isGlobal={false} />
          : <div className="__conversations">
            {this.renderConversations()}
          </div>
        }
        {!isConversationsDataLoading && (
          <div className="__refresh">
            <Button
              Icon={<Icon icon={IconNames.REFRESH} color={IconColor.LIGHT} />}
              label="Refresh"
              className="__refresh-button"
              onClick={this.handleRefresh}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  conversationsData: state.conversations.payload,
  dateRange: state.messages.dateRange,
  isConversationsDataLoading: state.conversations.isLoading,
  selectedContactNumberType: state.messages.selectedContactNumberType,
  selectedConversationId: state.messages.selectedConversationId,
  selectedUserNumbers: state.messages.selectedUserNumbers,
  sort: state.messages.sort
});

export const mapDispatchToProps = {
  clearSelectedUserNumbers: () => clearMessagesSelectedNumber(),
  getConversations: () => getConversationsData(),
  setSelectedConversationId: (selectedConversation: string | null) => setSelectedConversationId(selectedConversation),
  setSortType: (sortType: Sort) => setSortType(sortType)
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConversationList);