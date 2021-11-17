import gql from 'graphql-tag';

/** Used for handling changes to a user, this is most likely
 * being used for Assign Numbers. In order to update phone numbers
 * for a user, just send through the new list of phone numbers.
 * Example: If user A now has no phone numbers assigned, send an
 * empty array.
 */
export const updateUsersMutation = gql`
  mutation UpdateUsers($updates: [UpdateableUserFields]) {
    updateUsers(args: $updates) {
      id
      name
      physicalNumber
      directDialNumber
      phoneNumber {
        id
      }
    }
  }
`;

/** Updates User Numbers for assignments */
export const updatePhoneNumbersMutation = gql`
  mutation UpdatePhoneNumbers($updates: [UpdateablePhoneNumberFields]) {
    updatePhoneNumbers(args: $updates) {
      id
    }
  }
`;

/** Authenticates the user through the login flow */
export const authenticateUserMutation = gql`
  mutation authenticate($input: any) {
    tokenDetail: authenticate(input: $input)
    @rest(type: "AuthDetail", path: "/login", method: "POST") {
      accessToken
      refreshToken
      status
      session
    }
  }
`;

export const refreshTokenMutation = gql`
  mutation refreshToken($input: any) {
    tokenDetail: refreshToken(input: $input)
    @rest(type: "TokenDetail", path: "/refresh", method: "POST") {
      accessToken
    }
  }
`;

/** Sends a reset password email */
export const sendResetPasswordEmailMutation = gql`
  mutation resetPassword($input: any) {
    passwordRequest: resetPassword(input: $input)
    @rest(type: "PasswordRequest", path: "/password/forgot", method: "POST") {
      status
      NoResponse
    }
  }
`;

/** Registers a phone number */
export const registerPhoneNumberMutation = gql`
  mutation registerPhoneNumber($input: any) {
    numberRegistration: registerPhoneNumber(input: $input)
    @rest(type: "NumberRegistration", path: "/mfa/register", method: "POST") {
      status
      session
    }
  }
`;

/** Resets a password */
export const resetPasswordMutation = gql`
mutation resetPassword($input: any) {
  passwordReset: resetPassword(input: $input)
  @rest(type: "PasswordReset", path: "/password/confirm", method: "POST") {
    status
  }
}
`;

/** Resend MFA token */
export const resendMFACodeMutation = gql`
mutation resendMFACode($input: any) {
  resendMFA: resendMFACode(input: $input)
  @rest(type: "ResendMFA", path: "/mfa/resend", method: "POST") {
    status
    session
  }
}
`;

/** Starts a conversation for a given phone number */
export const startConversationMutation = gql`
  mutation StartConversation($userRealNumber: String, $contactRealNumber: String){
    createContact(userRealNumber: $userRealNumber, contactRealNumber: $contactRealNumber) {
      id
      systemNumber
    }
  }
`;

/** Delete a user with id */
export const deleteUserMutation = gql`
  mutation DeleteUser($id: Int){
    deleteUser(id: $id)
  }
`;

/** Creates a new user */
export const createNewUserMutation = gql`
  mutation CreateUser($name: String, $physicalNumber: String) {
    createUser(name: $name, physicalNumber: $physicalNumber) {
      id
      name
      physicalNumber
    }
  }
`;

/** Verifies URL token */
export const verifyURLTokenMutation = gql`
  mutation verifyURLToken($input: any) {
    tokenDetail: verifyURLToken(input: $input)
    @rest(type: "AuthDetail", path: "/invitation_tokens/validate", method: "POST") {
      name
      email
      orgSlug
    }
  }
`;

/** Updates Salesforce settings */
export const updateIntegrationSettingsMutation = gql`
  mutation updateOrganization($fields: UpdateableOrganizationFields) {
    updateOrganization(fields: $fields) {
      updatedAt
      integrationTokens {
        salesforce {
          value
        }
        smartAdvocate {
          value
        }
        genericCRM {
          value
        }
      }
      uplinkSalesforceIntegration {
        flags {
          syncCalls
          syncMessages
          syncRecords
        }
        metadata {
          lastSuccessfulSync
        }
        pollingInterval {
          increment
          unit
        }
      }
      smartAdvocateIntegration {
        flags {
          syncCalls
          syncRecords
          syncMessages
        }
        metadata {
          lastSuccessfulSync
        }
        pollingInterval {
          increment
          unit
        }
      }
      genericCRMIntegration {
        flags {
          syncCalls
          syncRecords
          syncMessages
        }
        metadata {
          lastSuccessfulSync
        }
        pollingInterval {
          increment
          unit
        }
      }
    }
  }
`;
