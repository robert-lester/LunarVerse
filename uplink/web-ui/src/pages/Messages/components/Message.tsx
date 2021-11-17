import * as React from 'react';
import moment from 'moment';
import Linkify from 'react-linkify';

import { UserInitials, PhoneType, PhoneTypeSize, Icon, IconColor, IconNames, IconSize } from '../../../components';
import './Message.scss';
import { UserNumber, UserNumberType, Sender, UserMessageType, Media, SenderPhone } from '../../../apollo/types';
import { ContactNumberType } from '../../../reducers';
import IconLogo from '../../../img/IconLogo';
import { withMediaLoader, InjectedWithMediaLoaderProps } from './MediaLoadHelper';

enum RenderTypes {
  AUDIO = 'Audio',
  VIDEO = 'Video'
}

interface MessageProps extends InjectedWithMediaLoaderProps {
  id: string;
  createdAt: string;
  media: Media[];
  message: string;
  duration: number;
  phoneNumbers: UserNumber[];
  selectedContactNumberType: ContactNumberType;
  sender: Sender;
  type: UserMessageType;
  senderPhone: SenderPhone;
}

type Props = MessageProps;

export class Message extends React.PureComponent<Props> {
  /** Handle media load */
  handleMediaLoad = () => {
    this.props.onMediaLoadComplete();
  }

  /** Handles any audio or video render issues */
  handleRenderError = (event: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>, url: string, type: RenderTypes) => {
    const anchorElement = document.createElement('a');
    anchorElement.setAttribute('href', url);
    anchorElement.text = type;
    anchorElement.className = '__link';
    if (event.currentTarget.parentElement) {
      // Not using replaceWith since it's not supported by IE or Safari
      event.currentTarget.parentElement.replaceChild(anchorElement, event.currentTarget);
      this.props.onMediaLoadComplete();
    }
  }

  /** Renders information from a phone call */
  renderPhoneCall = (isRightAligned: boolean, duration: number) => {
    // Checks to see if duration exists
    let callDuration;
    if (duration) {
      // Converts the duration (in seconds) to milliseconds
      const milliseconds = duration * 1000;
      const hours = duration && moment.duration(milliseconds).get('h');
      const minutes = moment.duration(milliseconds).get('m');
      const seconds = moment.duration(milliseconds).get('s');
      callDuration = hours + 'h ' + minutes + 'm ' + seconds + 's ';
    } else {
      callDuration = 'No duration';
    }
    return (
      <div className="__phone-call">
        <Icon
          icon={IconNames.PHONE_IN_TALK}
          size={IconSize.LARGE}
          color={IconColor.TWILIGHT}
        />
        <div className="__phone-call-info">
          {isRightAligned ? 'Outgoing Call' : 'Incoming Call'}
          <div className="__phone-call-duration">
            {callDuration}
          </div>
        </div>
      </div>
    );
  }

  /** Renders an image */
  renderImage = (url: string) => {
    // Done this way to include cached images
    const img = new Image();
    img.onload = this.handleMediaLoad;
    img.src = url;
    return <img className="__media" key={url} alt="image media" src={img.src} />;
  }

  /** Renders video */
  renderVideo = (url: string, type: string) => {
    return (
      <div className="__media">
        <video controls={true} onError={event => this.handleRenderError(event, url, RenderTypes.VIDEO)} onLoadedData={this.handleMediaLoad}>
          <source src={url} type={type} />
          Your browser does not support the video tag.
      </video>
      </div>
    );
  }

  /** Renders audio */
  renderAudio = (url: string, type: string) => {
    return (
      <div className="__media">
        <audio controls={true} onError={event => this.handleRenderError(event, url, RenderTypes.AUDIO)} onLoadedData={this.handleMediaLoad}>
          <source src={url} type={type} />
          Your browser does not support the audio tag.
        </audio>
      </div>
    );
  }

  mimeTypeRendering = {
    'image/': this.renderImage,
    'video/': this.renderVideo,
    'audio/': this.renderAudio
  };

  /** Renders media base on Media type (MIME type) */
  renderMedia = ({ mime_type, url }: Media, index: number) => {
    const mimeKey = Object.keys(this.mimeTypeRendering).find(key => mime_type.includes(key));
    // If not video, audio, image
    if (!mimeKey) {
      this.props.onMediaLoadComplete();
      return <a href={url} key={`${url}${index}`}>File</a>;
    }
    return this.mimeTypeRendering[mimeKey](url, mime_type);
  }

  /** Renders the icon based on User or Contact */
  renderIcon = (sender: Sender | null, isRightAligned: boolean, selectedContactNumberType: ContactNumberType, userNumber: string) => {
    if (sender) {
      // Contact recycled
      if (userNumber === 'Recycled') {
        return (
          <PhoneType
            status={UserNumberType.RECYCLED}
            size={PhoneTypeSize.REGULAR}
          />
        );
      }
      if (sender.name) {
        return (
          <UserInitials
            name={sender.name}
            userColor={sender.color || ''}
            className={isRightAligned ? '__reverse-initials' : ''}
            isAssigned={true}
          />
        );
      }
      // Contact icons
      if (selectedContactNumberType === ContactNumberType.REAL) {
        return (
          <PhoneType
            status={UserNumberType.CONTACT}
            size={PhoneTypeSize.REGULAR}
          />
        );
      } else {
        return (
          <div className="__contact-uplink">
            {IconLogo()}
          </div>
        );
      }
    }
    return;
  }

  /** Gets the User Number phone number for either a Contact or User (system or real numbers) */
  getPhoneNumber = (sender: Sender, phoneNumbers: UserNumber[], selectedContactNumberType: ContactNumberType) => {
    if (sender) {
      // Show system number
      if (sender.type === UserNumberType.USER || selectedContactNumberType === ContactNumberType.UPLINK) {
        return this.props.senderPhone ? this.props.senderPhone.systemNumber : '';
      }
      // Contact Real Number
      // TODO: Used elsewhere, centralize
      const contactNumber = phoneNumbers.find(phoneNumber => phoneNumber.type === UserNumberType.CONTACT);
      return contactNumber && contactNumber.user ? contactNumber.user.physicalNumber : '';
    }
    return 'Recycled';
  }

  linkify = (message: string) => {
    var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return message.replace(urlRegex, function (url: string) {

      return '<a href="' + url + '">' + url + '</a>';
    });
  }

  /** Renders a message (text, audio, video, image, phone call) */
  renderMessage = (media: Media[], message: string, isRightAligned: boolean, duration: number, type: UserMessageType) => {
    if (media && media.length) {
      return (
        <div className="__media-text">
          {media.map(this.renderMedia)}
          <span>{message}</span>
        </div>
      );
    } else if (type === UserMessageType.CALL) {
      return this.renderPhoneCall(isRightAligned, duration);
    } else {
      return message;
    }
  }

  render() {
    const {
      sender,
      media,
      message,
      duration,
      createdAt,
      type,
      phoneNumbers,
      selectedContactNumberType,
      id
    } = this.props;
    if (type === UserMessageType.SYSTEM) {
      return <div id={id} className="messages-message__reassign-user-text">{message}</div>;
    }
    const isRightAligned = (sender && (sender.type === UserNumberType.USER || sender.type === UserNumberType.UNASSIGNED));
    const userNumber = this.getPhoneNumber(sender, phoneNumbers, selectedContactNumberType);
    // Link decorator to add additional properties and custom CSS
    const linkDecorator = (href: string, text: string, key: number) => (
      <a href={href} key={key} target="_blank" className="messages-message__links">
        {text}
      </a>
    );
    return (
      <div id={id} className={`messages-message ${isRightAligned && '__reverse-message'}`}>
        {this.renderIcon(sender, isRightAligned, selectedContactNumberType, userNumber)}
        <div className="__text">
          <div className={`__dialogue ${isRightAligned && '__reverse-dialogue'}`}>
            <Linkify componentDecorator={linkDecorator}>
              {this.renderMessage(media, message, isRightAligned, duration, type)}
            </Linkify>
          </div>
          <h6 className={isRightAligned ? '__reverse-date' : ''}>{moment(createdAt).format('MM/DD/YY h:mm A')}&nbsp; {userNumber}</h6>
        </div>
      </div>
    );
  }
}

export default withMediaLoader(Message);
