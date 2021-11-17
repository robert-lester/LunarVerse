import * as React from 'react';
import { connect } from 'react-redux';
import { isValidNumber } from 'libphonenumber-js';

import './EditUser.scss';
import { Button, ButtonType, Input, ModalContent, ModalActions, Modal } from '../../../components';
import { GlobalState, ThunkDispatcher } from '../../../types';
import { UserToDelete } from './DeleteUser';
import { formatUserNumber } from '../../../utils';
import { toggleEditUserModal, toggleDeleteUserModal, updateUser } from '../../../actions';
import { ButtonVariant } from '../../../components/Button/Button';

interface State {
  name: string;
  phone: string;
}

interface MapDispatchToProps {
  toggleEditUserModal: () => void;
  toggleDeleteUserModal: (userToDelete: UserToDelete) => void;
  updateUser: (userUpdates: any) => void;
}

interface MapStateToProps {
  readonly isEditUserModalOpen: boolean;
  readonly isDeleteUserModalOpen: boolean;
  readonly userToEdit: UserToEdit;
}

const initialState = {
  name: '',
  phone: ''
};

export interface UserToEdit {
  name: string;
  phone: string;
  id: number;
}

type EditUserProps = MapDispatchToProps & MapStateToProps;

export class EditUser extends React.Component<EditUserProps, State> {
  state: State = initialState;

  componentDidUpdate(prevProps: EditUserProps) {
    if (prevProps.userToEdit !== this.props.userToEdit) {
      this.setState(this.props.userToEdit);
    }
  }

  /** Handles input changes */
  handleChange = ({ target: { value, name } }: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  }

  /** Handles the transfer of data from EditUser to Assignments and closed the EditUser Modal */
  handleUpdateUser = () => {
    this.props.updateUser({
      id: this.props.userToEdit.id,
      name: this.state.name,
      physicalNumber: this.state.phone
    });
  }

  toggleDeleteUserModal = () => {
    this.props.toggleDeleteUserModal({
      name: this.props.userToEdit.name,
      id: this.props.userToEdit.id
    });
  }

  /** Handles the check of a valid US area code for phone numbers */
  handleNumberValidation = (phone: string) => {
    if (isValidNumber(phone, 'US') || phone === '') {
      return '';
    }
    return 'Please enter a valid phone number';
  }

  /** Checks if form is valid */
  isFormValid = () => {
    if (this.state.name && this.state.phone && !this.handleNumberValidation(this.state.phone)) {
      return false;
    }
    return true;
  }

  render() {
    const { name, phone } = this.state;
    return (
      <Modal
        isOpen={this.props.isEditUserModalOpen}
        title="Edit User Information"
      >
        <ModalContent>
          <Input
            value={name}
            label="Full Name"
            className="edit-user__input"
            name="name"
            onChange={this.handleChange}
          />
          <Input
            value={formatUserNumber(phone)}
            label="Phone Number"
            className="edit-user__number-input"
            name="phone"
            onChange={this.handleChange}
            errorMessage={this.handleNumberValidation(phone)}
          />
        </ModalContent>
        <ModalActions className="edit-user__actions">
          <Button
            label="Delete"
            onClick={this.toggleDeleteUserModal}
            appearance={ButtonType.DANGER}
            variant={ButtonVariant.TEXT_ONLY}
          />
          <div className="--right">
            <Button
              label="Cancel"
              onClick={this.props.toggleEditUserModal}
              appearance={ButtonType.SECONDARY}
            />
            <Button
              label="Apply"
              onClick={this.handleUpdateUser}
              disabled={this.isFormValid()}
            />
          </div>
        </ModalActions>
      </Modal>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isEditUserModalOpen: state.user.isEditUserModalOpen,
  isDeleteUserModalOpen: state.user.isDeleteUserModalOpen,
  userToEdit: state.user.toEdit
});

const mapDispatchToProps = (dispatch: ThunkDispatcher) => ({
  toggleEditUserModal: () => dispatch(toggleEditUserModal()),
  toggleDeleteUserModal: (userToDelete: UserToDelete) => dispatch(toggleDeleteUserModal(userToDelete)),
  updateUser: (userUpdates: any) => dispatch(updateUser(userUpdates)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditUser);
