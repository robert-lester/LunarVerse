const jwt = require('jsonwebtoken');
const NosQl = require('../../nos-ql/NosQL');
const AuthorizationException = require('./exceptions/AuthorizationException');

class UserAuthorizer {
  constructor(user) {
    this.accessToken = user.accessToken;
    this.groups = user.groups || [];
    this.permissions = user.permissions || {};
    this.resources = user.resources || {};
    this.userPoolId = user.userPoolId || '';
  }

  inGroup(groupName) {
    if (!this.groups.includes(groupName)) {
      throw new AuthorizationException();
    }
  }

  isAdmin() {
    this.inGroup('admin');
  }

  isSuperAdmin() {
    if (this.userPoolId !== process.env.SUPER_ADMIN_POOL) {
      throw new AuthorizationException();
    }

    this.isAdmin();
  }

  listReadable(objectType) {
    return Object.keys(this.permissions)
      .filter(resourceId => resourceId.slice(0, objectType.length) === objectType)
      .map(resourceId => resourceId.slice(objectType.length + 1));
  }

  listWritable(objectType) {
    return this.listReadable(objectType)
      .filter(objectName => this.permissions[`${objectType}:${objectName}`] === true);
  }

  can(action, resourceId) {
    if (!['read', 'write'].includes(action)) {
      throw new AuthorizationException();
    }

    if (!this.groups.includes('admin')) {
      // eslint-disable-next-line
      if (action === 'read' && typeof this.permissions[resourceId] === 'undefined') {
        throw new AuthorizationException();
        // eslint-disable-next-line
      } else if (action === 'write' && !this.permissions[resourceId]) {
        throw new AuthorizationException();
      }
    }
  }
}

class UserAuthorizerFactory {
  constructor(table = `${process.env.API_RESOURCE_PREFIX}.users`, key = 'username', config = { region: 'us-east-1' }) {
    this.db = new NosQl(config);
    this.db.setTable(table, key);
  }

  getAuthorizer(accessToken, dummyUser) {
    const decodedToken = jwt.decode(accessToken, { complete: true });

    return new Promise((resolve, reject) => {
      if (dummyUser) {
        resolve(dummyUser);
      } else if (!decodedToken || !decodedToken.payload) {
        reject(new AuthorizationException());
      } else {
        this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.users`, 'username');
        this.db.read(decodedToken.payload.username)
          .then((user) => {
            if (!user) {
              reject(new AuthorizationException());
            } else {
              resolve(user);
            }
          }).catch((err) => {
            // eslint-disable-next-line
            console.error(err);
          });
      }
    })
      .then(user => new UserAuthorizer(Object.assign(user, {
        accessToken,
        userPoolId: decodedToken.payload.username.split(':')[0],
      })));
  }
}

module.exports = UserAuthorizerFactory;
