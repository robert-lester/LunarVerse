const slugify = str => str.toLowerCase().replace(/\s+/g, '-');

module.exports = {
  formatPoolUser: user => ({
    username: user.Username,
    attributes: (user.Attributes || user.UserAttributes || []).reduce((obj, field) => {
      const output = obj;
      if (field.Value === 'true') {
        output[field.Name] = true;
      } else if (field.Value === 'false') {
        output[field.Name] = false;
      } else {
        output[field.Name] = field.Value;
      }

      return output;
    }, {}),
    created_at: user.UserCreateDate,
    updated_at: user.UserLastModifiedDate,
    enabled: user.Enabled,
    status: user.UserStatus,
  }),
  generateIamPolicy: (principalId, effect, resource) => ({
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource,
      }],
    },
  }),
  slugify,
};
