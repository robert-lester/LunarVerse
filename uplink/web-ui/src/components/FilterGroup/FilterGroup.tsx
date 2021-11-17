import * as React from 'react';

import './FilterGroup.scss';

interface Props {
  children: JSX.Element[] | JSX.Element;
}

class FilterGroup extends React.PureComponent<Props> {
  render() {
    return (
      <div className="l-filter-group">
        {this.props.children}
      </div>
    )
  }
}

export default FilterGroup;