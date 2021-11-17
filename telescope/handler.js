// eslint-disable-next-line
const AWS = require('aws-sdk');
const Knex = require('knex');
require('mysql');
const lambda = require('../lib/lambda++');
const { UserAuthorizerFactory } = require('../lib/capsule/capsule');
const { AuthorizationController, cognitoAuthorizer } = require('../core/auth');
const { handler: intake } = require('../shuttle/api/handlers/tracking/TrackingIntakeHandler');

AWS.config.update({ region: process.env.AWS_REGION });

const authController = new AuthorizationController();
const authFactory = new UserAuthorizerFactory();

const API = require('./');
const dbConfig = require('./knexfile')[process.env.STAGE];

module.exports = {
  cognitoAuthorizer,
  createSite(event, context, callback) {
    const { attributes = {} } = lambda.parseBody(event.body);
    const TelescopeDB = Knex(dbConfig);
    const site = new API.Site(TelescopeDB, authController, authFactory);

    site.create(attributes)
      .then((result) => {
        lambda.response(result, callback);
        TelescopeDB.destroy();
      })
      .catch((err) => {
        lambda.handleError(err, callback);
        TelescopeDB.destroy();
      });
  },
  readVisit(event, context, callback) {
    const { visitId } = event.pathParameters;
    const TelescopeDB = Knex(dbConfig);
    const visit = new API.Visit(TelescopeDB, authController, authFactory);

    visit.read(visitId, { complex: false })
      .then((result) => {
        lambda.response(result, callback);
        TelescopeDB.destroy();
      })
      .catch((err) => {
        lambda.handleError(err, callback);
        TelescopeDB.destroy();
      });
  },
  intake,
};
