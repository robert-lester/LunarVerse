import * as React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import { Picker, BaseEmoji } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

import './Conversation.scss';
import { ContactNumberType } from '../../../reducers';
import { GlobalState } from '../../../types';
import { Icon, IconButton, Loading, IconNames, IconSize, TextArea } from '../../../components';
import { IconColor } from '../../../components/Icon/Icon';
import { Message as MessageType, ConversationData } from '../../../apollo/types';
import { Message, LazyLoader } from './';
import { getConversationData, clearConversationData, setSelectedConversationId, LAZY_LOAD_OFFSET } from '../../../actions';
import { getMediaCount } from '../../../utils/messages';
import { IconButtonType } from '../../../components/IconButton/IconButton';

interface Props {
  isSalesforce?: boolean;
}

interface MapStateToProps {
  readonly conversation: ConversationData | null;
  readonly isConversationLoading: boolean;
  readonly selectedConversationId: string | null;
  readonly selectedContactNumberType: ContactNumberType;
}

interface MapDispatchToProps {
  getConversationData: (offset?: number) => void;
  clearConversationData: () => void;
  setSelectedConversationId: (selectedConversationId: string | null) => void;
}

interface State {
  isMediaLoadComplete: boolean;
  textMessage: any;
  isEmojiPickerOpen: boolean;
}

type ConversationProps = MapStateToProps & MapDispatchToProps & Props;

const initialState = {
  isMediaLoadComplete: false,
  textMessage: '',
  isEmojiPickerOpen: false
};

export class Conversation extends React.PureComponent<ConversationProps, State> {
  mediaCount: number = 0;
  mediaCompleteCount: number = 0;
  canConversationScrollToBottom: boolean = true;
  state = initialState;

  componentDidMount() {
    if (this.props.selectedConversationId) {
      this.props.getConversationData();
    }
  }

  componentWillUnmount() {
    this.props.setSelectedConversationId(null);
    this.props.clearConversationData();
  }

  componentDidUpdate(prevProps: ConversationProps) {
    if (prevProps.selectedConversationId !== this.props.selectedConversationId) {
      this.resetMediaTracking();
      if (this.props.selectedConversationId) {
        this.props.getConversationData();
      }
    }
    if (!_.isEqual(this.props.conversation, prevProps.conversation) && this.props.conversation) {
      this.mediaCount = getMediaCount(this.props.conversation.messages);
      // If no media, complete load
      if (!this.mediaCount) {
        this.setState({ isMediaLoadComplete: true }, this.scrollConversationToBottom);
      }
    }
  }

  /** Renders selection message */
  renderSelectionMessage = () => {
    const { isSalesforce } = this.props;
    return (
      <div className={`messages-conversation__select-conversation ${isSalesforce ? '--salesforce' : ''}`}>
        <Icon
          icon={IconNames.CHAT_BUBBLE_OUTLINE}
          size={IconSize.XLARGE}
          color={IconColor.TWILIGHT}
        />
        <h1>Select a conversation to read.</h1>
      </div>
    );
  }

  /** Handles the completion of message's media */
  handleMediaLoadComplete = () => {
    this.mediaCompleteCount++;
    if (this.mediaCount === this.mediaCompleteCount) {
      this.setState({ isMediaLoadComplete: true }, this.scrollConversationToBottom);
    }
  }

  /** Handles the fecthing of data forwards or backwards */
  handleFetch = (offset: number) => {
    this.props.getConversationData(offset);
    // Let the media loader know not to scroll
    this.canConversationScrollToBottom = false;
  }

  /** Scrolls the conversations to the bottom, should occur on all media load complete */
  scrollConversationToBottom = () => {
    const conversationElement = document.getElementById('uplink-conversations');
    // Scroll to bottom
    if (conversationElement && this.canConversationScrollToBottom) {
      conversationElement.scrollTop = conversationElement.scrollHeight;
    }
  }

  /** Reset media counts and completion */
  resetMediaTracking = () => {
    this.canConversationScrollToBottom = true;
    this.mediaCount = this.mediaCompleteCount = 0;
    this.setState({ isMediaLoadComplete: false });
  }

  /** Renders a single message */
  // TODO: Look into lowering this insane amount of props
  renderMessage = ({
    created_at, media, message, public_id, sender, type, phoneNumber, duration
  }: MessageType) => (
      // TODO: Lessen the amount of props being passed here
      <Message
        senderPhone={phoneNumber}
        sender={sender}
        createdAt={created_at}
        duration={duration}
        message={message}
        media={media}
        type={type}
        id={public_id}
        key={public_id}
        phoneNumbers={this.props.conversation!.phoneNumbers}
        selectedContactNumberType={this.props.selectedContactNumberType}
        onMediaLoadComplete={this.handleMediaLoadComplete}
      />
    )

  /** Handles sending the text message */
  handleSendMessage = () => {
    /*TODO: Hook this function up to the send message mutation */
    const { conversation } = this.props;
    const variables = {
      phoneNumbers: conversation!.phoneNumbers.map(phoneNumber => phoneNumber.systemNumber),
      message: this.state.textMessage
    };
    this.setState({ textMessage: '' });
    console.log(variables);
  }

  /* Hanldes the state of showing/hiding the emoji picker */
  handleEmojiPicker = () => {
    this.setState({ isEmojiPickerOpen: !this.state.isEmojiPickerOpen })
  }

  /* Adds the selected emoji to the textarea state */
  handleAddEmoji = (emoji: BaseEmoji) => {
    const { textMessage } = this.state;
    const text = `${textMessage}${emoji.native}`;
    this.setState({
      textMessage: text,
      isEmojiPickerOpen: false
    });
  }

  /** Handles text message changes */
  handleTextMessageChange = ({ target: { value: textMessage } }: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ textMessage });
  }

  render() {
    const { conversation, isSalesforce, isConversationLoading, selectedConversationId } = this.props;
    if (!conversation && !isConversationLoading) {
      return this.renderSelectionMessage();
    }
    // Should main blocking loader show
    const isConversationHidden = (isConversationLoading && !conversation) || (!this.state.isMediaLoadComplete && conversation);
    return (
      <>
        {
          isConversationHidden &&
          <Loading isGlobal={false} className="messages-conversation__loading" />
        }
        <div className={`messages-conversation ${isConversationHidden ? '--hidden' : '--visible'}`}>
          <div id="uplink-conversations" className={`messages-conversation__messages ${isSalesforce ? '--salesforce' : ''}`}>
            <LazyLoader
              isDataLoading={isConversationLoading}
              onFetch={this.handleFetch}
              dataSize={conversation ? conversation.messages.length : 0}
              requestedSize={LAZY_LOAD_OFFSET}
              requestId={selectedConversationId}
            >
              {conversation ? conversation.messages.map(this.renderMessage) : []}
            </LazyLoader>
            {this.state.isEmojiPickerOpen &&
              <Picker
                set='apple'
                emoji="point_up"
                onSelect={this.handleAddEmoji}
                title="Pick your emoji..."
                style={{ position: 'absolute', bottom: '60px', right: '20px', zIndex: 100 }}
              />
            }
            { /*TODO: Remove this localStorage check when feature is ready to be released */
              localStorage.sendMessagesUI &&
              <div className="messages-conversation__text-message-bar">
                <div className="messages-conversation__text-message-bar-container">
                  <TextArea
                    placeholder="Text Message"
                    value={this.state.textMessage}
                    onChange={this.handleTextMessageChange}
                    containerClassName="messages-conversation__message-input-container"
                    className="messages-conversation__text-message-input"
                  />
                  <Icon
                    className="messages-conversation__emojiSelectorIcon"
                    icon={IconNames.TAG_FACES}
                    size={IconSize.MEDIUM}
                    color={IconColor.TWILIGHT}
                    onClick={this.handleEmojiPicker}
                  />
                  <IconButton
                    Icon={<Icon icon={IconNames.ARROW_UPWARD} color={IconColor.LIGHT} />}
                    label="Send"
                    type={IconButtonType.ACTION}
                    onClick={this.handleSendMessage}
                  />
                </div>
              </div>
            }
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  conversation: state.conversation.payload,
  isConversationLoading: state.conversation.isLoading,
  selectedContactNumberType: state.messages.selectedContactNumberType,
  selectedConversationId: state.messages.selectedConversationId
});

export const mapDispatchToProps = {
  clearConversationData: () => clearConversationData(),
  getConversationData: (offset?: number) => getConversationData(offset),
  setSelectedConversationId: (selectedConversation: string | null) => setSelectedConversationId(selectedConversation)
};

export default connect(mapStateToProps, mapDispatchToProps)(Conversation);
