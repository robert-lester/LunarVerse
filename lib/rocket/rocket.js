const Email = require('./integrations/email');
const Http = require('./integrations/http');
const Launchforce = require('./integrations/launchforce');
const Salesforce = require('./integrations/salesforce');
const Slack = require('./integrations/slack');
const SMS = require('./integrations/sms');
const GoogleSheets = require('./integrations/googlesheets');
// const SugarCRM = require('./integrations/sugar');
// const Telescope = require('./integrations/telescope');
// const Zoho = require('./integrations/zoho');

module.exports = {
  Email,
  GoogleSheets,
  Http,
  Launchforce,
  Salesforce,
  Slack,
  SMS,
  // SugarCRM,
  // Telescope,
  // Zoho,
};
