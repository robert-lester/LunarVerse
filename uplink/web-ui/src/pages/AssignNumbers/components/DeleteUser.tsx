import * as React from 'react';
import { connect } from 'react-redux';

import './DeleteUser.scss';
import './EditUser.scss';
import { Button, ButtonType, ModalContent, ModalActions, Modal } from '../../../components';
import { GlobalState, ThunkDispatcher } from '../../../types';
import { closeDeleteUserModal, deleteUser, toggleDeleteUserModal } from '../../../actions';

interface MapDispatchToProps {
  closeDeleteUserModal: () => void;
  deleteUser: () => void;
  toggleDeleteUserModal: () => void;
}

interface MapStateToProps {
  readonly isDeleteUserLoading: boolean;
  readonly isDeleteUserModalOpen: boolean;
  readonly userToDelete: UserToDelete;
}

export interface UserToDelete {
  name: string;
  id: number;
}

type DeleteUserProps = MapDispatchToProps & MapStateToProps;

export class DeleteUser extends React.Component<DeleteUserProps> {
  /** Deletes a user */
  handleDeleteUser = () => {
    this.props.deleteUser();
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isDeleteUserModalOpen}
        title="Delete User"
      >
        <>
          <ModalContent>
            Are you sure you want to delete this user? All pending changes will be saved on confirmation.
          </ModalContent>
          <ModalActions>
            <Button
              isLoading={this.props.isDeleteUserLoading}
              label="Confirm"
              onClick={this.handleDeleteUser}
              appearance={ButtonType.DANGER}
            />
            <Button
              label="Cancel"
              onClick={this.props.toggleDeleteUserModal}
              appearance={ButtonType.SECONDARY}
            />
          </ModalActions>
        </>
      </Modal>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isDeleteUserLoading: state.user.isDeleteUserLoading,
  isDeleteUserModalOpen: state.user.isDeleteUserModalOpen,
  userToDelete: state.user.toDelete
});

const mapDispatchToProps = (dispatch: ThunkDispatcher) => ({
  closeDeleteUserModal: () => dispatch(closeDeleteUserModal()),
  deleteUser: () => dispatch(deleteUser()),
  toggleDeleteUserModal: () => dispatch(toggleDeleteUserModal())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeleteUser);