import * as React from 'react';

import './Switch.scss';
import { Label } from '../Label/Label';

interface Props {
  checked: boolean;
  onChange: () => void;
  label?: string;
  subtext?: string;
}

export default class Switch extends React.PureComponent<Props> {
  render() {
    return (
      <div className="l-switch">
        <div className={`__input --${this.props.checked ? 'checked' : 'unchecked'}`} onClick={this.props.onChange}>
          <div className="__toggle"></div>
          <div className="__track"></div>
        </div>
        {this.props.label && <Label label={this.props.label} />}
        {this.props.subtext && <small>{this.props.subtext}</small>}
      </div>
    );
  }
}
