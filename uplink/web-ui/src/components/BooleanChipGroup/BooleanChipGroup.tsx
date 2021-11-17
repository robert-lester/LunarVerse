import * as React from 'react';

import './BooleanChipGroup.scss';

interface Props {
  className?: string;
  children: any;
}

class BooleanChipGroup extends React.PureComponent<Props> {
  render() {
    return (
      <div className={`l-boolean-chip-group ${this.props.className}`}>
        {this.props.children}
      </div>
    );
  }
};

export default BooleanChipGroup;
