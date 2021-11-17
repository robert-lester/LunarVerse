import * as React from 'react';
import { createPortal } from 'react-dom';

import './Modal.scss';

interface Props {
  title: string;
  isOpen?: boolean;
}

export default class Modal extends React.Component<Props> {
  element = document.getElementById('pop-up-portal');
  render() {
    return createPortal(
      this.props.isOpen && (
        <div className="l-modal">
          <div className="l-modal__cover"/>
          <div className="l-modal__container">
            <div className="l-modal__header">
              <h3 className="l-modal__title">{this.props.title}</h3>
            </div>
            <div className="l-modal__children">
              {this.props.children}
            </div>
          </div>
        </div>
      ),
      this.element as HTMLElement,
    );
  }
}
