import * as React from 'react';

import './PercentageCircle.scss';

interface Styling {
  leftProgress: {
    display: string;
    transform: string;
  };
  rightProgress: {
    transform: string;
  };
  innerCircle: {
    left: number;
    top: number;
    width: number;
    height: number;
    borderRadius: number;
  };
}
interface Props {
  percent: number;
  className?: string;
}

export default class PercentageCircle extends React.PureComponent<Props> {
  static defaultProps = {
    percent: 0,
    className: ''
  };

  /** Gets the styling for the circles */
  getStyling = (): Styling => {
    const { percent } = this.props;
    const lineWidth = 3;
    let leftProgressDegree = '0deg';
    let rightProgressDegree = '0deg';
    let leftDisplay = 'block';
    if (percent >= 50) {
      rightProgressDegree = '180deg';
      leftProgressDegree = `${(percent - 50) * 3.6}deg`;
    } else {
      rightProgressDegree = `${percent * 3.6}deg`;
      leftDisplay = 'none';
    }
    return {
      leftProgress: {
        display: leftDisplay,
        transform: `rotate(${leftProgressDegree})`
      },
      rightProgress: {
        transform: `rotate(${rightProgressDegree})`
      },
      innerCircle: {
        left: lineWidth,
        top: lineWidth,
        width: (75 - lineWidth) * 2,
        height: (75 - lineWidth) * 2,
        borderRadius: 75 - lineWidth,
      }
    };
  }
  render() {
    const styling = this.getStyling();
    return (
      <div className={`l-percentage-circle ${this.props.className}`}>
        <div className="l-percentage-circle__left-wrap">
          <div className="l-percentage-circle__left-progress" style={styling.leftProgress} />
        </div>
        <div className="l-percentage-circle__right-wrap">
          <div className="l-percentage-circle__right-progress" style={styling.rightProgress} />
        </div>
        <div className="l-percentage-circle__inner-circle">
          {this.props.children}
        </div>
      </div>
    );
  }
}
