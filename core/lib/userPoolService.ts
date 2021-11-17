import * as utf8 from 'utf8';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { AuthorizationController } from '../auth';
import { HTTPError } from '../../lib/lambda-context';

export const DEFAULT_USER_POOL_CLIENT_CONFIG = {
  ClientName: 'Launch That Apps',
  // NOTE: GenerateSecret does not work correctly in the Cognito Node SDK
  GenerateSecret: false,
  RefreshTokenValidity: 1,
};

export enum Applications {
  SHUTTLE = 'shuttle',
  UPLINK = 'uplink',
}

interface EmailMessages {
  verificationEmailMessage: string;
  inviteEmailMessage: string;
}

export default abstract class UserPoolService {
  provider: CognitoIdentityServiceProvider;
  constructor() {
    this.provider = new AuthorizationController().provider;
  }

  private static getUserPoolConfig({
    application,
    inviteEmailMessage,
    isMFARequired,
    verificationEmailMessage,
  }: {
    application: Applications;
    inviteEmailMessage: string;
    isMFARequired: boolean;
    verificationEmailMessage: string;
  }) {
    return {
      Policies: {
        PasswordPolicy: {
          MinimumLength: 8,
          RequireUppercase: true,
          RequireLowercase: true,
          RequireNumbers: true,
          RequireSymbols: false,
        },
      },
      AutoVerifiedAttributes: ['email'],
      VerificationMessageTemplate: {
        EmailMessage: utf8.encode(verificationEmailMessage),
        EmailSubject: 'Forgot Your Password?',
        DefaultEmailOption: 'CONFIRM_WITH_LINK',
      },
      EmailConfiguration: {
        ReplyToEmailAddress: process.env.DEFAULT_EMAIL_SENDER,
      },
      AdminCreateUserConfig: {
        AllowAdminCreateUserOnly: true,
        InviteMessageTemplate: {
          EmailMessage: utf8.encode(inviteEmailMessage),
          EmailSubject: UserPoolService.getInviteEmailSubject(application),
        },
        // UnusedAccountValidityDays: 7,
      },
      MfaConfiguration: isMFARequired ? 'ON' : 'OPTIONAL',
      SmsAuthenticationMessage: application === Applications.UPLINK ? '{####} is your Uplink authentication code.' : 'Your Lunar Apps verification code is: {####}',
      SmsConfiguration: {
        ExternalId: process.env.SNS_EXTERNAL_ID,
        SnsCallerArn: process.env.SNS_CALLER_ARN,
      },
    };
  }

  /** Gets email template */
  private getEmailMessages = (application: Applications, org: string, userName?: string): EmailMessages => {
    return {
      verificationEmailMessage: application === Applications.SHUTTLE
        ? this.generateShuttleForgotPasswordEmailMessage(org, userName)
        : this.generateUplinkEmailMessage('Forgot your password?', this.generateUplinkForgotPasswordEmailBody(org, userName), 'No worries, let\'s get you a new one.'),
      inviteEmailMessage: application === Applications.SHUTTLE
        ? this.generateShuttleNewUserEmailMessage(org, userName)
        : this.generateUplinkEmailMessage('Your Uplink Organization is active! Ready to get started?', this.generateUplinkNewUserEmailBody(org, userName))
    }
  }

  /** Gets an Uplink email template */
  private generateUplinkEmailMessage = (subject: string, body: string, preheader = '') => {
    return (
      `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <!-- Facebook sharing information tags -->
        <meta property="og:title" content="${subject}" />
        <title>${subject}</title>
      </head>
      <body bgcolor="#FAFAFA" style="-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; height: 100% !important; width: 100% !important; background-color: #FAFAFA; margin: 0; padding: 0;">
        <style type="text/css">
          #outlook a {
            padding: 0;
          }
          .body{
            width: 100% !important;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            margin: 0;
            padding: 0;
          }
          .ExternalClass {
            width:100%;
          }
          .ExternalClass,
          .ExternalClass p,
          .ExternalClass span,
          .ExternalClass font,
          .ExternalClass td,
          .ExternalClass div {
            line-height: 100%;
          }
          img {
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
          }
          a img {
            border: none;
          }
          p {
            margin: 1em 0;
          }
          table td {
            border-collapse: collapse;
          }
          /* hide unsubscribe from forwards*/
          blockquote .original-only, .WordSection1 .original-only {
            display: none !important;
          }
          @media only screen and (max-width: 480px){
            body, table, td, p, a, li, blockquote {
              -webkit-text-size-adjust:none !important;
            } /* Prevent Webkit platforms from changing default text sizes */
            body{
              width:100% !important;
              min-width:100% !important;
            } /* Prevent iOS Mail from adding padding to the body */
            #bodyCell{
              padding:10px !important;
            }
            #templateContainer{
              max-width:480px !important;
              width:100% !important;
            }
            h1{
              font-size:28px !important;
              line-height:100% !important;
            }
            h2{
              font-size:26px !important;
              line-height:100% !important;
            }
            h3{
              font-size:18px !important;
              line-height:100% !important;
            }
            h4{
              font-size:16px !important;
              line-height:100% !important;
            }
            /* Force table cells into rows */
            td[class="hh-force-col"],
            td[class="hh-force-col-center"] {
              display: block !important;
              width: 100% !important;
              clear: both;
              font-size: 22px !important;
            }
            /* And center these ones */
            td[class="hh-force-col-center"] {
              text-align: center !important;
              padding-right: 0px !important;
            }
            .headerContent{
              font-size:24px !important;
              line-height:125% !important;
            }
            .bodyContent{
              font-size:22px !important;
              line-height:125% !important;
            }
            .footerContent{
              font-size:14px !important;
              line-height:115% !important;
            }
            #bodyImage{
              height:auto !important;
              max-width:560px !important;
              width:100% !important;
            }
            .bodyContent{
              font-size:22px !important;
              line-height:125% !important;
            }
            .footerContent{
              font-size:14px !important;
              line-height:115% !important;
            }
            #bodyCell{
              padding: 15px 5px 15px 5px !important;
            }
            .btn-primary {
              font-size: 22px !important;
            }
            /*.footerContent a{display:block !important;}/* Place footer social and utility links on their own lines, for easier access */
          }
        </style>
        <table align="center" border="0" cellpadding="0" cellspacing="0" id="bodyTable" style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #FAFAFA; border-collapse: collapse !important; height: 100% !important; margin: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; padding: 0; width: 100% !important" width="100%">
          <tbody>
            <tr>
              <td align="center" id="bodyCell" style="-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt; height: 100% !important; width: 100% !important; border-top-width: 0px; border-top-color: #dddddd; border-top-style: solid; margin: 0; padding: 40px;" valign="top">
                <!-- BEGIN TEMPLATE // -->
                <table border="0" cellpadding="0" cellspacing="0" id="templateContainer" style="-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse !important; width: 600px; border: 1px solid #dddddd;">
                  <tbody>
                    ${preheader &&
      `<tr>
                        <td align="center" style="-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt;" valign="top"><!-- BEGIN PREHEADER // -->
                        <table border="0" cellpadding="0" cellspacing="0" id="templatePreheader" style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #FFFFFF; border-bottom-color: #CCCCCC; border-bottom-style: solid; border-bottom-width: 1px; border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt" width="100%">
                          <tbody>
                            <tr>
                              <td align="left" class="preheaderContent" pardot-region="preheader_content00" style="text-size-adjust: 100%; color: rgb(128, 128, 128); font-family: Helvetica; font-size: 10px; line-height: 12.5px; text-align: left; padding: 30px 20px; display: none;" valign="top">${preheader}</td>
                            </tr>
                          </tbody>
                        </table>
                        <!-- // END PREHEADER --></td>
                      </tr>`
      }
                    <tr>
                      <td align="center" style="-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt;" valign="top"><!-- BEGIN HEADER // -->
                      <table border="0" cellpadding="0" cellspacing="0" id="templateHeader" style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; border-bottom-color: #CCCCCC; border-bottom-style: solid; border-bottom-width: 0px; border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff !important" width="100%">
                        <tbody>
                          <tr pardot-repeatable="">
                            <td>
                            <table align="center" border="0" cellpadding="0" cellspacing="0" class="email-container" style="margin: auto;" width="600">
                              <tbody>
                                <tr pardot-repeatable="">
                                  <td align="center" class="headerContent" pardot-region="header_image" style="-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #505050; font-family: Open Sans; font-size: 20px; font-weight: bold; line-height: 20px; vertical-align: middle; padding: 10px 0px 0px 0px;" valign="top"><img alt="" id="headerImage" src="https://go.belunar.com/l/184682/2018-12-11/228yzk2/184682/41687/EmailHeader_UplinkLogoOnWhite_600w.png" style="display: block; max-width: 600px; -ms-interpolation-mode: bicubic; height: auto; outline: none; text-decoration: none; border: 0; text-align: center;"></td>
                                </tr>
                                <tr>
                                </tr>
                              </tbody>
                            </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <!-- // END HEADER --></td>
                    </tr>
                    <tr>
                      <td align="center" style="-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt;" valign="top">
                      <!-- BEGIN BODY // -->
                      <table border="0" cellpadding="0" cellspacing="0" id="templateBody" style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #FFFFFF; border-bottom-color: #CCCCCC; border-bottom-style: solid; border-bottom-width: 1px; border-collapse: collapse !important; border-top-color: #FFFFFF; border-top-style: solid; border-top-width: 1px; mso-table-lspace: 0pt; mso-table-rspace: 0pt" width="100%">
                        <tbody>
                          ${body}
                        </tbody>
                      </table>
                      <!-- // END BODY -->
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt;" valign="top"><!-- BEGIN FOOTER // -->
                      <table border="0" cellpadding="0" cellspacing="0" id="templateFooter" style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #20272d; border-collapse: collapse !important; border-top-color: #20272d; border-top-style: solid; border-top-width: 1px; mso-table-lspace: 0pt; mso-table-rspace: 0pt" width="100%">
                        <tbody>
                          <tr>
                            <td align="left" class="footerContent" pardot-region="footer_content01" style="-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #ffffff; font-family: Helvetica; font-size: 12px; line-height: 12px; letter-spacing: .4px; text-align: center; padding: 30px 20px 40px 20px;" valign="top">&copy; ${new Date().getFullYear()} Expect The Moon, LLC DBA Lunar. All Rights Reserved<br>
                            <br>
                            <span>1</span> <span>S.</span> <span>Orange</span> <span>Ave.</span> <span>Suite</span> <span>302</span> <span>Orlando,</span> <span>FL</span> <span>32801</span></td>
                          </tr>
                        </tbody>
                      </table>
                      <!-- // END FOOTER --></td>
                    </tr>
                  </tbody>
                </table>
                <!-- // END TEMPLATE -->
              </td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>`
    )
  };

  /** Generates Shuttle's forgot password email */
  private generateShuttleForgotPasswordEmailMessage = (org: string, userName: string = '') => {
    return (
      `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Reset password</title>
      </head>
      <body style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;width: 100%;height: 100%;margin: 0;color: #343434;font-size: 16px;">
        <div style="margin: 24px 24px 24px 24px;">
          <img style="margin: 0 0 12px 0;" src="http://www.belunar.com/wp-content/uploads/2018/02/lunar.png" alt"Lunar" />
          ${userName && `<p>Hi, ${userName}!</p>`}
          <p>
            You recently requested to reset your password for your Lunar account. Use the button below to reset it.
            <strong>This password reset is only valid for the next 7 days.</strong>
          </p>
          <a href="https://shuttle${process.env.STAGE_PREFIX}.belunar.com?code={####}&org=${encodeURIComponent(org)}&type=confirmPassword" target="_blank" style="padding: 12px 24px 12px 24px;border-radius: 4px;background-color: #084C7F;color: #FFF;text-decoration: none;line-height: 96px;">Reset your password</a>
          <p>
            If you have any questions, please <a style="color: #084C7F;font-weight: bold;text-decoration: none;" href="mailto:support@belunar.com">contact support</a>.
          </p>
          <p>Thanks,
          <br>Lunar Support</p>
        </div>
      </body>
      </html>`
    );
  }

  /** Generates Shuttle's new user email */
  private generateShuttleNewUserEmailMessage = (org: string, userName: string = '') => {
    return (
      `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>New User</title>
      </head>
      <body style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;width: 100%;height: 100%;margin: 0;color: #343434;font-size: 16px;">
        <div style="margin: 24px 24px 24px 24px;">
          <img style="margin: 0 0 12px 0;" src="http://www.belunar.com/wp-content/uploads/2018/02/lunar.png" alt"Lunar" />
          ${userName && `<p>Hi, ${userName}!</p>`}
          <p>
            Congratulations, your Lunar account for the <strong>${org}</strong> Organization can now be accessed. Use the button below to access it.
            To ensure your account's security, please note that this link <strong> will only work for the next 7 days.</strong>
          </p>
          <p style="display: none;">{username}</p>
          <a style="padding: 12px 24px 12px 24px;border-radius: 4px;background-color: #084C7F;color: #FFF;text-decoration: none;line-height: 96px;" href="https://shuttle${process.env.STAGE_PREFIX}.belunar.com?token={####}&type=newUser" target="_blank">Launch Account</a>
          <p>
            If you have any questions, please <a style="color: #084C7F;font-weight: bold;text-decoration: none;" href="mailto:support@belunar.com">contact support</a>.
          </p>
          <p>Thanks,
          <br>Lunar Support</p>
        </div>
      </body>
      </html>`
    );
  }

  /** Generates Shuttle's forgot password email */
  private generateUplinkForgotPasswordEmailBody = (org: string, userName: string = '') => {
    return (
      `<tr pardot-repeatable="">
        <td align="left" class="bodyContent" pardot-region="body_content00" style="-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #505050; font-family: Helvetica; font-size: 14px; line-height: 21px; text-align: left; padding: 20px 20px 0px 20px;" valign="top">
          ${userName && `Hi, ${userName}! `}It looks like you requested a new password.
          <br>
          <br>
          If that is true, you can reset your password by clicking the button below.
          <br>
          <br>
          <br>
        </td>
      </tr>
      <tr pardot-repeatable="" style="font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0; padding: 0;">
        <td align="center" class="content-block" pardot-region="body_content" style="font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0px;" valign="top">
          <a class="btn-primary" target="_blank" href="https://uplink${process.env.STAGE_PREFIX}.belunar.com?code={####}&org=${encodeURIComponent(org)}&type=confirmPassword" style="box-sizing: border-box; font-size: 18px; font-family: Helvetica; color: #FFF; text-decoration: none; line-height: 1.4; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 5px; text-transform: capitalize; background-color: #0049a0; margin: 0; padding: 0; letter-spacing: .75px; padding: 10px 5%; ">
            RESET PASSWORD
          </a>
        </td>
      </tr>
      <tr pardot-repeatable="">
        <td align="left" class="bodyContent" pardot-region="body_content00" style="-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #505050; font-family: Helvetica; font-size: 14px; line-height: 21px; text-align: left; padding: 20px 20px 0px 20px;" valign="top">
          <br>
          <i>This link will expire in 1 hour.</i>
          <br>
          <br>
          If you have any issues or didn't request a password reset, <a href="mailto:support@belunar.com">let us know</a>.
          <br>
          <br>
          <br>
        </td>
      </tr>`
    );
  }

  /** Generates Shuttle's new user email */
  private generateUplinkNewUserEmailBody = (org: string, userName: string = '') => {
    return (
      `<tr pardot-repeatable="">
        <td align="left" class="bodyContent" pardot-region="body_content00" style="-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #505050; font-family: Helvetica; font-size: 14px; line-height: 21px; text-align: left; padding: 20px 20px 0px 20px;" valign="top">
          ${userName && `<p>Hi, ${userName}!</p>`}  
          Thanks for signing up! We're happy to have you on board.
          <br>
          <br>
        </td>
      </tr>
      <tr pardot-repeatable="" style="font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0; padding: 0;">
        <td align="center" class="content-block" pardot-region="body_content" style="font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0px;" valign="top">
          <a class="btn-primary" target="_blank" href="https://uplink${process.env.STAGE_PREFIX}.belunar.com?token={####}&type=newUser" style="box-sizing: border-box; font-size: 18px; font-family: Helvetica; color: #FFF; text-decoration: none; line-height: 1.4; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 5px; text-transform: capitalize; background-color: #0049a0; margin: 0; padding: 0; letter-spacing: .75px; padding: 10px 5%; ">
            LOG INTO UPLINK
          </a>
        </td>
      </tr>
      <tr pardot-repeatable="">
        <td align="left" class="bodyContent" pardot-region="body_content00" style="-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #505050; font-family: Helvetica; font-size: 14px; line-height: 21px; text-align: left; padding: 20px 20px 0px 20px;" valign="top">
          <br>
          ${ org ? `Your Uplink Organization Name is <b>${org}</b>.<br><br>` : '' }
          To ensure your account's security, <b>this link will only work for the next 7 days</b>. When you first log in, you will be prompted to change your password. 
          <br>
          <br>
          Please let us know if you have any issues. You can contact our Support Team at support@belunar.com or text us - (407) 807-6149.
          <br>
          <br>
          Many thanks,
          <br>
          The Lunar Team
          <br>
          <br>
          <br>
          <p style="display: none;">{username}</p>
        </td>
      </tr>`
    );
  }

  /** Gets invite email subject based on application */
  private static getInviteEmailSubject = (application: Applications) => {
    if (application === Applications.UPLINK) {
      return 'Your Uplink Organization is active! Ready to get started?';
    }
    return 'Welcome to Lunar';
  }

  /** Org exists, update email templates */
  public async updateUserPool(userPoolId: string, application: Applications, org: string, userName: string) {
    if (!userPoolId) {
      throw new HTTPError(400, 'No user pool ID provided.');
    }
    const { verificationEmailMessage, inviteEmailMessage } = this.getEmailMessages(application, org, userName);

    // TODO: Look this up in the User Pool
    const isMFARequired = false;

    return this.provider.updateUserPool(Object.assign({
      // This property is only allowed on updates, not initial creation
      UserPoolId: userPoolId,
    }, UserPoolService.getUserPoolConfig({
      application,
      inviteEmailMessage,
      isMFARequired,
      verificationEmailMessage,
    }))).promise();
  }

  /** Creates a user pool (org) */
  public createUserPool(org: string, application: Applications, isMFARequired = false) {
    if (!org) {
      throw new HTTPError(400, 'No org provided.');
    }

    const { verificationEmailMessage, inviteEmailMessage } = this.getEmailMessages(application, org);

    return this.provider.createUserPool(Object.assign({
      // These two properties are only allowed on initial creation, not updates
      AliasAttributes: ['email'],
      PoolName: `${process.env.API_RESOURCE_PREFIX}.${org}`,
    }, UserPoolService.getUserPoolConfig({
      application,
      inviteEmailMessage,
      isMFARequired,
      verificationEmailMessage,
    }))).promise();
  }
}
