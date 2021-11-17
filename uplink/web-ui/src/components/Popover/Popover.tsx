import * as React from 'react';
import Downshift from 'downshift';

import './Popover.scss';

interface Props {
  className?: string;
  clickElement: React.ReactNode;
  onToggle: () => void;
  isOpen: boolean;
}

export default class Popover extends React.Component<Props> {
  render() {
    const {
      className,
      clickElement
    } = this.props;
    return (
      <Downshift>
        {({ getToggleButtonProps, isOpen }) => (
          <div className={className} {...getToggleButtonProps()}>
            {clickElement}
            <div style={{ position: 'relative' }}>
              {isOpen && (
                <div className="l-popover__content">
                  {this.props.children}
                </div>
              )}
            </div>
          </div>
        )}
      </Downshift>
    );
  }
}
