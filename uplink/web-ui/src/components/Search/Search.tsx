import * as React from 'react';

import './Search.scss';
import { Icon, IconColor, IconNames, IconSize, Input } from '../';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  search: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default class Search extends React.Component<Props> {
  render() {
    const { className, search, onChange, placeholder } = this.props;
    return (
      <div className={className}>
        <div className="l-search">
          <Icon
            className="__icon"
            icon={IconNames.SEARCH}
            color={IconColor.DARK}
            size={IconSize.SMALL}
          />
          <Input
            placeholder={placeholder}
            value={search}
            onChange={onChange}
          />
        </div>
      </div>
    );
  }
}