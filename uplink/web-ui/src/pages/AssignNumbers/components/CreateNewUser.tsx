import * as React from 'react';
import { connect } from 'react-redux';
import { isValidNumber } from 'libphonenumber-js';

import { Input, Button, ButtonType, ModalActions, ModalContent, Modal } from '../../../components';
import { formatUserNumber } from '../../../utils';
import { toggleNewUserModal, createNewUser } from '../../../actions';
import { ThunkDispatcher, GlobalState } from '../../../types';
import { CreateNewUserVariables } from '../../../apollo/types';
import './CreateNewUser.scss';

interface State {
  name: string;
  physicalNumber: string;
}

interface MapStateToProps {
  isNewUserModalOpen: boolean;
  isCreateNewUserLoading: boolean;
}

interface MapDispatchToProps {
  toggleNewUserModal: () => void;
  createNewUser: (newUser: CreateNewUserVariables) => void;
}

type CreateNewUserProps = MapStateToProps & MapDispatchToProps;

const initialState = {
  name: '',
  physicalNumber: '',
};

export class CreateNewUser extends React.Component<CreateNewUserProps, State> {
  state: State = initialState;

  componentDidUpdate(prevProps: CreateNewUserProps) {
    if (prevProps.isNewUserModalOpen && !this.props.isNewUserModalOpen) {
      this.setState(initialState);
    }
  }

  /** Handles input changes */
  handleChange = ({ target: { value, name } }: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  }

  /** Handles the check of a valid US area code for phone numbers */
  handleNumberValidation = (physicalNumber: string) => {
    if (isValidNumber(physicalNumber, 'US') || physicalNumber === '') {
      return '';
    }
    return 'Please enter a valid phone number';
  }

  /** Handle create new user */
  handleCreateNewUser = () => {
    const variables = {
      name: this.state.name,
      physicalNumber: this.state.physicalNumber,
    };
    this.props.createNewUser(variables);
  }

  render() {
    const { name, physicalNumber } = this.state;
    return (
      <Modal
        isOpen={this.props.isNewUserModalOpen}
        title="Create New User"
      >
        <ModalContent>
          <Input
            value={name}
            label="Full Name"
            className="create-new-user__input"
            name="name"
            onChange={this.handleChange}
          />
          <Input
            value={formatUserNumber(physicalNumber)}
            label="Phone Number"
            className="create-new-user__number-input"
            name="physicalNumber"
            onChange={this.handleChange}
            errorMessage={this.handleNumberValidation(physicalNumber)}
          />
        </ModalContent>
        <ModalActions>
          <Button
            label="Cancel"
            appearance={ButtonType.SECONDARY}
            onClick={this.props.toggleNewUserModal}
          />
          <Button
            label="Create User"
            onClick={this.handleCreateNewUser}
            isLoading={this.props.isCreateNewUserLoading}
            disabled={!name || !isValidNumber(physicalNumber, 'US') || !physicalNumber ? true : false}
          />
        </ModalActions>
      </Modal>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isNewUserModalOpen: state.user.isNewUserModalOpen,
  isCreateNewUserLoading: state.user.isCreateNewUserLoading
});

const mapDispatchToProps = (dispatch: ThunkDispatcher) => ({
  createNewUser: (variables: CreateNewUserVariables) => dispatch(createNewUser(variables)),
  toggleNewUserModal: () => dispatch(toggleNewUserModal())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateNewUser);
