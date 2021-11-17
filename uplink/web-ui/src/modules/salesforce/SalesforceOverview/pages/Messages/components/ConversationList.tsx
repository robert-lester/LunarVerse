import * as React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import './ConversationList.scss';
import {
  DateRange,
  ConversationData,
  UserNumberType,
  User
} from '../../../../../../apollo/types';
import {
  Icon,
  IconNames,
  Loading,
  IconColor,
  Button,
  ConversationListItem,
  IconButton
} from '../../../../../../components';
import { Sort, GlobalState } from '../../../../../../types';
import { sortDateAscending, sortDateDescending } from '../../../../../../utils';
import {
  setSortType,
  setSelectedConversationId,
  getConversationsData,
  startConversation,
  setConversationView,
  setMessagesDateRange
} from '../../../../../../actions';
import { ContactNumberType } from '../../../../../../reducers';
import { IconButtonType } from '../../../../../../components/IconButton/IconButton';
import Filters from './Filters';
import FilterGroup from '../../../../../../components/FilterGroup/FilterGroup';
import Chip from '../../../../../../components/Chip/Chip';
import { SORTING } from '../../../../../../constants';

interface MapStateToProps {
  readonly conversationsData: ConversationData[];
  readonly dateRange: DateRange;
  readonly isConversationsDataLoading: boolean;
  readonly selectedContactNumberType: ContactNumberType;
  readonly selectedConversationId: string | null;
  readonly sort: Sort;
  readonly isStartConversationLoading: boolean;
  readonly userData: User | null;
}

interface MapDispatchToProps {
  getConversations: (specifiedUserNumbers: string[]) => void;
  setDateRange: (dateRange: DateRange) => void;
  setSelectedConversationId: (selectedConversation: string | null) => void;
  setSortType: (sort: Sort) => void;
  setConversationView: (conversationView: string) => void;
  startConversation: () => void;
}

interface Props {
  userNumber?: string;
}

interface State {
  isFiltersOpen: boolean;
}

const initialState = {
  isFiltersOpen: false
};

type ConversationListProps = MapDispatchToProps & MapStateToProps & Props;

export class ConversationList extends React.Component<ConversationListProps, State> {
  state: State = initialState;

  componentDidMount() {
    this.getConversations();
  }

  /** Gets conversations list */
  getConversations = () => {
    const specifiedUserNumbers = this.props.userNumber ? [this.props.userNumber] : [];
    this.props.getConversations(specifiedUserNumbers);
  }

  /** Refetches the conversation list */
  handleRefresh = () => {
    this.getConversations();
  }

  /** Open/closes the filters menu */
  toggleFilters = () => {
    this.setState({ isFiltersOpen: !this.state.isFiltersOpen });
  }

  /** Handles filter changes */
  handleConversationFilters = (dateRange: DateRange, sort: Sort) => {
    this.props.setDateRange(dateRange);
    this.getConversations();
    this.props.setSortType(sort);
    this.setState({ isFiltersOpen: false });
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
        isContactVisible={false}
        contactDisplay={this.props.selectedContactNumberType}
        onClick={() => {
          this.props.setConversationView('conversation')
          this.props.setSelectedConversationId(public_id)
        }}
        key={public_id}
      />
    );
  }

  /** Renders conversations */
  renderConversations = () => {
    const {
      conversationsData,
      sort,
    } = this.props;
    const utilities = {
      sortDateAscending,
      sortDateDescending,
    };
    const sortUtility = sort === Sort.ASC ? 'sortDateDescending' : 'sortDateAscending';

    // Sort conversations by prop
    const mutableConversations = [...conversationsData];
    const sortedConversations = mutableConversations.sort((a, b) =>
      utilities[sortUtility](a, b, 'updated_at'),
    );
    const conversations = sortedConversations.map(this.renderConversation);
    // Render conversations or show message if none to show
    return conversations && conversations.length ? (
      conversations
    ) : (
        <div className="__empty-message">No conversations exist.</div>
      );
  }

  render() {
    const { dateRange, isConversationsDataLoading, isStartConversationLoading, sort, userData } = this.props;
    const { isFiltersOpen } = this.state;
    return (
      <div className="sf-conversation-list">
        {isFiltersOpen &&
          <Filters
            sort={sort}
            dateRange={dateRange}
            onClose={this.toggleFilters}
            onSubmit={this.handleConversationFilters}
          />
        }
        <div className="__actions">
            <Button
              label="Start Conversation"
              onClick={this.props.startConversation}
              isLoading={isStartConversationLoading}
              disabled={!userData}
            />
            <IconButton
              Icon={<Icon icon={IconNames.FILTER_LIST} color={IconColor.LIGHT}/>}
              label="Filter"
              type={IconButtonType.ACTION}
              onClick={this.toggleFilters}
            />
        </div>
        <FilterGroup>
          <Chip iconName={IconNames.ARROW_UPWARD} label={SORTING[sort]}/>
          <Chip iconName={IconNames.DATE_RANGE} label={`${moment(dateRange.initial as moment.Moment).format('MM/DD/YYYY')} - ${moment(dateRange.final as moment.Moment).format('MM/DD/YYYY')}`}/>
        </FilterGroup>
        {isConversationsDataLoading
          ? <Loading isGlobal={false} />
          : <div className="__conversations">
            {this.renderConversations()}
          </div>
        }
        <div className="__refresh">
          <Button
            Icon={<Icon icon={IconNames.REFRESH} color={IconColor.LIGHT} />}
            label="Refresh"
            className="__refresh-button"
            onClick={this.handleRefresh}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  conversationsData: state.conversations.payload,
  dateRange: state.messages.dateRange,
  isConversationsDataLoading: state.conversations.isLoading,
  isStartConversationLoading: state.sfModules.isStartConversationLoading,
  selectedContactNumberType: state.messages.selectedContactNumberType,
  selectedConversationId: state.messages.selectedConversationId,
  sort: state.messages.sort,
  userData: state.user.userData
});

export const mapDispatchToProps = {
  getConversations: (specifiedUserNumbers: string[]) => getConversationsData(specifiedUserNumbers),
  setConversationView: (conversationView: string) => setConversationView(conversationView),
  setDateRange: (dateRange: DateRange) => setMessagesDateRange(dateRange),
  setSelectedConversationId: (selectedConversationId: string | null) => setSelectedConversationId(selectedConversationId),
  setSortType: (sortType: Sort) => setSortType(sortType),
  startConversation: () => startConversation()
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConversationList);