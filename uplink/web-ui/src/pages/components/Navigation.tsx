import * as React from 'react';
import { NavLink, withRouter, RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import './Navigation.scss';
import Feedback from '../Feedback/Feedback';
import IconLogo from '../../img/IconLogo';
import { IconButton, Icon, Button, IconNames, ButtonType, Modal, ModalActions, ModalContent } from '../../components';
import { IconColor } from '../../components/Icon/Icon';
import { MATERIAL_COLORS } from '../../constants';
import { signOut } from '../../actions';

interface Link {
  url: string;
  color: string;
  icon: IconNames;
  label: string;
}

interface MapDispatchToProps {
  signOut: () => void;
}

interface State {
  isSignOutOpen: boolean;
  isFeedbackOpen: boolean;
}

type Props = RouteComponentProps<{}> & MapDispatchToProps;

export class Navigation extends React.Component<Props, State> {
  state = {
    isSignOutOpen: false,
    isFeedbackOpen: false
  };
  /** TODO: REMOVE SF_ACTIVITY FEATURE TOGGLE */
  links: Link[] = [
    {
      url: '/messages',
      color: 'orange',
      icon: IconNames.FORMAT_LIST_BULLETED,
      label: 'Messages',
    },
    {
      url: '/activity',
      color: 'purple',
      icon: IconNames.TIMELINE,
      label: 'Activity',
    },
    {
      url: '/assign',
      color: 'green',
      icon: IconNames.PERSON,
      label: 'Assignment',
    },
    {
      url: '/settings',
      color: 'yellow',
      icon: IconNames.SETTINGS,
      label: 'Settings',
    },
  ];

  /** Toggles sign out modal */
  toggleSignOut = () => {
    this.setState({ isSignOutOpen: !this.state.isSignOutOpen });
  }

  /** Logs the user out */
  handleSignOut = () => {
    sessionStorage.clear();
    this.props.signOut();
    this.props.history.push('/');
    this.toggleSignOut();
  }

  /** Handles showing the feedback form */
  handleToggleFeedback = () => {
    this.setState({ isFeedbackOpen: !this.state.isFeedbackOpen });
  }

  /** Renders a single link */
  renderLink = (link: Link) => {
    return (
      <NavLink
        key={link.url}
        to={link.url}
        className="__link"
        activeStyle={{
          borderLeft: `4px solid ${MATERIAL_COLORS[link.color]}`,
        }}
      >
        <IconButton
          className="__icon"
          Icon={<Icon icon={link.icon} color={IconColor.TWILIGHT} />}
          label={link.label}
          onDark={true}
        />
      </NavLink>
    );
  }

  render() {
    return (
      <nav className="navigation">
        <div className="__brand">
          <div className="__brand-logo">{IconLogo()}</div>
        </div>
        {this.links.map(this.renderLink)}
        <div className="__bottom-icons">
          <div
            className="__link"
            onClick={this.handleToggleFeedback}
          >
            <IconButton
              className="__icon"
              Icon={<Icon icon={IconNames.FEEDBACK} color={IconColor.TWILIGHT} />}
              label="Feedback"
              onDark={true}
            />
          </div>
          <a
            href="https://docs.belunar.com/"
            rel="noopener noreferrer"
            target="_blank"
            className="__link"
          >
            <IconButton
              className="__icon"
              Icon={<Icon icon={IconNames.HELP_OUTLINE} color={IconColor.TWILIGHT} />}
              label="Help"
              onDark={true}
            />
          </a>
          <div
            className="__link"
            onClick={this.toggleSignOut}
          >
            <IconButton
              className="__icon"
              Icon={<Icon icon={IconNames.SIGN_OUT} color={IconColor.TWILIGHT} />}
              label="Sign out"
              onDark={true}
            />
          </div>
        </div>
        {this.state.isFeedbackOpen &&
          <Feedback onClose={this.handleToggleFeedback}/>
        }
        <Modal
          title="Sign Out"
          isOpen={this.state.isSignOutOpen}
        >
          <ModalContent>
            Are you sure you want to sign out?
          </ModalContent>
          <ModalActions>
            <Button
              label="Cancel"
              onClick={this.toggleSignOut}
              appearance={ButtonType.SECONDARY}
            />
            <Button
              label="Sign Out"
              onClick={this.handleSignOut}
            />
          </ModalActions>
        </Modal>
      </nav>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  signOut: () => dispatch(signOut())
});

export default withRouter(connect<null, MapDispatchToProps>(
  null,
  mapDispatchToProps
)(Navigation));
