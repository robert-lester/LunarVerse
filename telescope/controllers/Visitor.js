const Joi = require('joi');
const { Controller } = require('../../lib/capsule/capsule');
const ResourceNotFoundException = require('../exceptions/ResourceNotFoundException');

const {
  EVENT_TYPE_MAP,
  HEIRIAL_ID_REGEX,
  HEIRIAL_STATE_REGEX,
  IP_REGEX,
  LOAD_ID_REGEX,
} = require('../config');

const formatVisitorResponse = visitor => ({
  created_at: visitor.created_at,
  data: JSON.parse(visitor.data),
  fingerprint: JSON.parse(visitor.fingerprint),
  lead_uid: visitor.lead_uid,
  site_uid: visitor.site_uid,
  uid: visitor.uid,
  updated_at: visitor.updated_at,
});

class Visitor extends Controller {
  constructor(database, authController, authFactory) {
    super();

    this.database = database;
    this.authController = authController;
    this.userAuthorizerFactory = authFactory;

    this.schema = {
      read: Joi.object().keys({
        id: Joi.string().regex(HEIRIAL_ID_REGEX).required(),
      }),
      upsert: Joi.object().keys({
        attributes: Joi.object().keys({
          data: Joi.object().required(),
          event_tag: Joi.string().valid(Object.keys(EVENT_TYPE_MAP)).required(),
          load_uid: Joi.string().regex(LOAD_ID_REGEX).required(),
          site_uid: Joi.string().regex(HEIRIAL_ID_REGEX).required(),
          sourceIp: Joi.string().regex(IP_REGEX).required(),
          state: Joi.string().regex(HEIRIAL_STATE_REGEX).required(),
          timestamp: Joi.date().iso(),
          uid: Joi.string().regex(HEIRIAL_ID_REGEX).required(),
          userAgent: Joi.string().required(),
          visit_uid: Joi.string(),
          visitor_uid: Joi.string(),
        }).required(),
      }),
    };
  }

  read(id) {
    return this.database('sites')
      .innerJoin('visitors', 'sites.uid', 'visitors.site_uid')
      .where('visitors.uid', id)
      .first()
      .then((visitors) => {
        if (!visitors.length) {
          throw new ResourceNotFoundException('Visitor', id);
        }

        return formatVisitorResponse(visitors[0]);
      });
  }

  upsert(attributes) {
    const currentTime = new Date();

    return this.database.raw(`
      ? ON DUPLICATE KEY UPDATE
          data = VALUES(data),
          fingerprint = VALUES(fingerprint),
          updated_at = VALUES(updated_at)
    `, this.database('visitors').insert({
      created_at: currentTime.toISOString(),
      data: JSON.stringify(attributes.data),
      fingerprint: JSON.stringify({
        ip_address: attributes.sourceIp,
        user_agent_server: attributes.userAgent,
      }),
      site_uid: attributes.site_uid,
      uid: attributes.visitor_uid || attributes.state.split('::')[0],
      updated_at: currentTime.toISOString(),
    }));
  }
}

module.exports = Visitor;
