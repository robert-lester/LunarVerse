import * as React from 'react';
import ReactGA from 'react-ga';

import { Menu, IconNames } from '../../components';
import { Conversation, Aside, ConversationList } from './components';

class Messages extends React.Component {
  componentDidMount() {
    ReactGA.pageview(window.location.pathname);
  }

  render() {
    return (
      <>
        <Menu icon={IconNames.FORMAT_LIST_BULLETED} title="Messages">
          <Aside />
        </Menu>
        <ConversationList />
        <Conversation />
      </>
    );
  }
}

export default Messages;
