import * as React from 'react';
import { NavLink } from 'react-router-dom';

import './SubNavigationLink.scss';

interface Props {
  to: string;
  label: string;
  isChild?: boolean;
  disabled?: boolean;
}

export default class SubNavigationLink extends React.PureComponent<Props> {
  render() {
    const { isChild = false, disabled = false } = this.props;
    return (
      <NavLink
        to={this.props.to}
        activeClassName={`${disabled ? '' : '--active'}`}
        className={`l-sub-navigation-link ${isChild ? '--child' : ''} ${disabled ? '--disabled' : ''}`}
        exact={true}
      >
        {this.props.label}
      </NavLink>
    );
  }
}
