import * as React from 'react';

import './Tabs.scss';

interface Props {
  options: string[];
  onClick: (index: number, event: React.MouseEvent<HTMLDivElement>) => void;
  selected: number;
}

export const Tabs = ({ options, onClick, selected }: Props) => (
  <div className="l-tabs">
    {options.map((item, index) => (
      <div
        key={index}
        className="__option"
        onClick={e => onClick(index, e)}
      >
        <div className="__label">
          {item}
        </div>
      </div>
    ))}
    <div className="__selection-container">
      <div className="__selection-underline" style={{ left: `${selected * 50}%` }} />
    </div>
  </div>
);
