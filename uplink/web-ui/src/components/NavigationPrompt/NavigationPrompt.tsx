import * as React from 'react';
import Prompt, { ChildData } from 'react-router-navigation-prompt';

import './NavigationPrompt.scss';
import { Button, Modal, ButtonType } from '../';
import { ModalContent, ModalActions } from '../Modal';

export const NavigationPrompt = ({ when }: { when: boolean }) => (
  <Prompt
    when={when}
  >
    {({ onCancel, onConfirm }: ChildData) => (
      <Modal
        isOpen={true}
        title="Confirm Navigation"
      >
        <ModalContent>
          Your changes have not yet been saved. Are you sure you want to leave this page?
        </ModalContent>
        <ModalActions>
          <Button
            label="Leave this page"
            onClick={onConfirm}
            appearance={ButtonType.DANGER}
          />
          <Button
            label="Stay on this page"
            onClick={onCancel}
            appearance={ButtonType.PRIMARY}
          />
        </ModalActions>
      </Modal>
    )}
  </Prompt>
);
