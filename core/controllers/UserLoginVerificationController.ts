import * as NosQl from '../../lib/nos-ql';
import SlackNotification from '../../lib/notifications/slack';
import { DynamoDBUser, CognitoUser, DynamoDBOrg } from '../@types';
import { HTTPError } from '../../lib/lambda-context';

export default class UserLoginVerificationController {
  /**
   * Create a new instance of the UserController
   * @param {AuthorizationController} authController An instance of the AuthorizationController
   */
  provider: any;
  db: any;
  constructor(authController) {
    this.provider = authController.provider;
    this.db = new NosQl();
  }

   /**
   * Get all users that were invited to an org within the last 4 days
   * and check if they have logged in. Notify Customer Support if they have not
   * @returns {string} A string of success if successful
   */
  public async checkUsersForLogin() {
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.users`, 'username');

    const users: DynamoDBUser[] = await this.db.index();
    // Get the timestamps for now.
    const now = new Date().getTime();
    // Calculate to get 72 hours and 96 hours from now.
    const seventyTwoHoursFromNow = now - (72 * 60 * 60 * 1000);
    const ninetySixHoursFromNow = now - (96 * 60 * 60 * 1000);
    // Filter out the users that were created after 72 hours but before 96 hours from now
    const usersList: DynamoDBUser[] = users.filter(user => user.createdAt < seventyTwoHoursFromNow
      && user.createdAt > ninetySixHoursFromNow);

    await this.filterUnloggedInUsers(usersList);
  }

  /**
   * Look up in Cognito if the Users have logged in or not
   * @param {array} users Array of users
   */
  private async filterUnloggedInUsers(users: DynamoDBUser[]) {
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.users`, 'username');

    // Look into Cognito and check the UserStatus of the user
    const filteredUsers: CognitoUser[] = await Promise.all(users
      .map(async user => this.provider.adminGetUser({
        UserPoolId: user.userPoolId,
        Username: user.username,
      })
        .promise()
        .then((res: CognitoUser) => {
          if (res && res.UserStatus === 'FORCE_CHANGE_PASSWORD') {
            // add users name to the cognito results
            res.name = user.name;

            return res;
          }
        })
        .catch((err) => {
          if (err) throw err;
        })
    )).then((userList: CognitoUser[]) => userList.filter(user => user));

    // Send Slack Message about users
    this.createSupportSlackMessage(filteredUsers);
  }

  /**
   * Send Customer Success a Slack Message
   * @param {array} users A list of users who have not logged into their org, according to Cognito
   */
  private createSupportSlackMessage(users: CognitoUser[]) {
    users.forEach(async (user) => {
      const [userPoolId, email] = user.Username.split(':');
      // Get the name of the organization
      const org = await this.getOrgByUserPoolId(userPoolId);

      const data = `Org: ${org.name}\nEmail: ${email}\nName: ${user.name}\nInitial Invite: ${user.UserCreateDate}\n`;
      const sendSlackMessage = new SlackNotification();

      sendSlackMessage.sendToSlack(data);
    });
  }

  /**
   * Get the organization by User Pool Id
   * @param {string} userPoolId the user pool id of the organization
   * @returns an organization
   */
  public async getOrgByUserPoolId(userPoolId: string): Promise<DynamoDBOrg> {
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');
    // Get all organizations
    const orgs: DynamoDBOrg[] = await this.db.index();
    // Filter by userPoolId
    const org: DynamoDBOrg = orgs.filter(org => org.userPoolId === userPoolId)[0];
    if (!org) {
      throw new HTTPError(404, 'No organization found.');
    }

    return org;
  }
}
