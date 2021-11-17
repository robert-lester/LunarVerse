import * as React from 'react';
import * as enzyme from 'enzyme';

import { Global } from '../../types';
import Modal from '../Modal/Modal';

describe('Modal', () => {
  let mounted: enzyme.ReactWrapper;
  let component;

  // Add a div to render Modal portal
  const modalRoot = (global as Global).document.createElement('div');
  modalRoot.setAttribute('id', 'pop-up-portal');
  const body = (global as Global).document.querySelector('body');
  body!.appendChild(modalRoot);

  beforeEach(() => {
    component = (
      <Modal title="Test">
        <div>Content</div>
      </Modal>
    );
    mounted = enzyme.mount(component);
  });

  afterEach(() => {
    mounted.unmount();
  });

  it('should render', () => {
    expect(mounted.length).toEqual(1);
  });
});
