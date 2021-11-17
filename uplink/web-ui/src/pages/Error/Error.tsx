import * as React from 'react';
import { Link } from 'react-router-dom';
import ReactGA from 'react-ga';

import { Icon, Button, IconSize, ButtonType, IconNames } from '../../components';
import { IconColor } from '../../components/Icon/Icon';
import './Error.scss';

export default class Error extends React.PureComponent {
  componentDidMount() {
    ReactGA.pageview(window.location.pathname);
  }

  render() {
    return (
      <div id="Error" className="error">
        <div className="__wrap">
          <Icon icon={IconNames.SENTIMENT_VERY_DISSATISFIED} size={IconSize.XLARGE} color={IconColor.LIGHT} />
          <h1>Houston, we have a problem.</h1>
          <h4>Sorry, we cannot find the page you are looking for.</h4>
          <Link to="/messages" className="__back">
            <Button
              label="Back to home page"
              appearance={ButtonType.SECONDARY}
              className="__back-button"
            />
          </Link>
        </div>
      </div>
    )
  }
}
