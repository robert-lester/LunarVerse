import * as React from 'react';
import { createPortal } from 'react-dom';

import Logo from '../../img/Logo';

interface Props {
  onClose: () => void;
}

export default class Feedback extends React.PureComponent<Props> {
  containerElement = document.createElement('div');
  feedbackWindow: Window | null = null;

  componentDidMount() {
    this.feedbackWindow = window.open('', '', 'width=600,height=800,left=200,top=200');
    if(this.feedbackWindow) {
      this.feedbackWindow.document.title = 'Uplink Feedback Form';
      this.feedbackWindow.document.body.appendChild(this.containerElement);
    }
  }

  componentWillUnmount() {
    if(this.feedbackWindow) {
      this.feedbackWindow.close();
    }
    this.props.onClose();
  }
  render() {
    return createPortal(
      <div style={{ textAlign: 'center' }}>
        {Logo()}
        <h2>Feedback Form</h2>
        <iframe src="https://s3.amazonaws.com/shuttle-production-forms/forms/44bec4b6-8a66-4ec5-b87a-94cb62906f7c/iframe.html" width="100%" height="100%" frameBorder="0">
          <p>Your browser does not support iframes.</p>
        </iframe>
        <script src="https://cdn.belunar.com/formbuilder/client.js" />
      </div>,
      this.containerElement
    );
  }
}