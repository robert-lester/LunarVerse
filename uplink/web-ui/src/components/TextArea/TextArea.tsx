import * as React from 'react';

import './TextArea.scss';
import { Label } from '../';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  containerClassName?: string;
}

export default class TextArea extends React.PureComponent<Props> {
  
  componentDidMount() {
    var tx = document.getElementsByTagName('textarea');
    for (var i = 0; i < tx.length; i++) {
      tx[i].setAttribute('style', 'height:' + (tx[i].scrollHeight) + 'px;overflow-y:hidden;');
      tx[i].addEventListener("input", OnInput, false);
    }

    function OnInput(this: any) {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
      this.style.margin = "16px 0";
    }
  }

  render() {
    const {
      label,
      className,
      containerClassName,
      ...props
    } = this.props;
    return (
      <div className={`l-textarea ${containerClassName}`}>
        {label && <Label label={label} />}
        <textarea
          id="textArea"
          className={`__element ${className}`}
          rows={1}
          {...props as HTMLAllCollection}
        />
      </div>
    );
  }
}