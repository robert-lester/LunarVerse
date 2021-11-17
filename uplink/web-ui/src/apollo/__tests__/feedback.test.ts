import feedback from '../feedback';
import { NotificationType } from '../../components';

describe('feedback', () => {
  it('should render', () => {
    const div = document.createElement('DIV');
    div.id = 'notifications';
    document.body.appendChild(div);
    feedback([{
      message: 'Test',
      type: NotificationType.SUCCESS
    }]);
    expect(document.getElementsByClassName('l-notifications')[0]).toBeTruthy();
  });
});