import * as React from 'react';

import { Modal, Button, ButtonType } from '../';
import './DeleteModal.scss';

interface Props {
  onDelete: () => void;
  onToggle: () => void;
  type: string;
}

export default class DeleteModal extends React.Component<Props> {
  render() {

    return (
      <Modal
        title="Confirm Delete"
      >
        <div>
          <div className="l-delete-modal__delete-message">
            Are you sure you want to delete this {this.props.type}?
          </div>
          <Button label="Delete" onClick={this.props.onDelete} />
          <Button
            label="Cancel"
            className="l-delete-modal__cancel-button"
            onClick={this.props.onToggle}
            appearance={ButtonType.SECONDARY}
          />
        </div>
      </Modal>
    );
  }
}
