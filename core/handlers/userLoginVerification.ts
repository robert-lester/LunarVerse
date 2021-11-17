import { ScheduleHandler } from '../../lib/lambda-context';
import UserLoginVerificationController from '../controllers/UserLoginVerificationController';
import { AuthorizationController } from '../auth';

// Controller dependencies
const authController = new AuthorizationController();
const controller = new UserLoginVerificationController(authController);

const userLoginVerificationHandler = async () => {
  await controller.checkUsersForLogin();
  return {
    body: '',
    headers: {
      'Content-Type': 'text/plain',
    },
    statusCode: 200,
  };
};

export const handler = new ScheduleHandler()
  .bind(userLoginVerificationHandler);
