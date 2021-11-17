import * as React from 'react';

import './Icon.scss';

export enum IconSize {
  XSMALL = 'xsmall',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  XLARGE = 'xlarge'
}

export enum IconColor {
  DARK = 'dark',
  LIGHT = 'light',
  TWILIGHT = 'twilight'
}

export enum IconNames {
  ADD = 'add',
  ANNOUNCEMENT = 'announcement',
  ARROW_BACK = 'arrow_back',
  ARROW_DOWNWARD = 'arrow_downward',
  ARROW_DROP_DOWN = 'arrow_drop_down',
  ARROW_UPWARD = 'arrow_upward',
  AUTO_RENEW = 'autorenew',
  CANCEL = 'cancel',
  CHAT_BUBBLE_OUTLINE = 'chat_bubble_outline',
  CHECK_CIRCLE = 'check_circle',
  CHECK_CIRCLE_OUTLINE = 'check_circle_outline',
  CHECKBOX = 'check_box',
  CHECKBOX_OUTLINE_BLANK = 'check_box_outline_blank',
  CLOSE = 'close',
  CONTENT_COPY = 'content_copy',
  DATE_RANGE = 'date_range',
  EDIT = 'edit',
  EMAIL = 'email',
  ERROR = 'error',
  ERROR_OUTLINE = 'error_outline',
  FEEDBACK = 'feedback',
  FILTER_LIST = 'filter_list',
  FORMAT_LIST_BULLETED = 'format_list_bulleted',
  HELP_OUTLINE = 'help_outline',
  INFO = 'info',
  MORE_VERT = 'more_vert',
  PERSON = 'person',
  PERSON_ADD = 'person_add',
  PHONE = 'phone',
  PHONE_IN_TALK = 'phone_in_talk',
  PHONE_IPHONE = 'phone_iphone',
  PHONE_FORWARDED = 'phone_forwarded',
  PRIORITY_HIGH = 'priority_high',
  RADIO_BUTTON_CHECKED = 'radio_button_checked',
  RADIO_BUTTON_UNCHECKED = 'radio_button_unchecked',
  REMOVE_CIRCLE = 'remove_circle',
  REFRESH = 'refresh',
  REMOVE = 'remove',
  SEARCH = 'search',
  SENTIMENT_VERY_DISSATISFIED = 'sentiment_very_dissatisfied',
  SAVE = 'save',
  SETTINGS = 'settings',
  SIGN_OUT = 'power_settings_new',
  SWAP_HORIZONTAL = 'swap_horiz',
  TAG_FACES = 'tag_faces',
  TEXT_SMS = 'textsms',
  TIMELINE = 'timeline',
  WARNING = 'warning'
}

interface Props {
  className?: string;
  color?: IconColor;
  icon: IconNames;
  onClick?: (event: any) => void;
  size?: IconSize;
}

export const Icon = ({
  className = '',
  color = IconColor.DARK,
  icon,
  onClick,
  size = IconSize.MEDIUM,
  ...rest
}: Props) => {
  const classes = `material-icons l-icon --${size} --${color} ${className}`;
  return (
    <i className={classes} onClick={onClick} {...rest}>
      {icon}
    </i>
  );
};