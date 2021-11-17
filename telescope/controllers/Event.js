const Joi = require('joi');
const { Controller } = require('../../lib/capsule/capsule');

const {
  EVENT_TYPE_MAP,
  HEIRIAL_ID_REGEX,
  HEIRIAL_STATE_REGEX,
  IP_REGEX,
} = require('../config');

class Event extends Controller {
  constructor(database, authController, authFactory) {
    super();

    this.database = database;
    this.authController = authController;
    this.userAuthorizerFactory = authFactory;

    this.schema = {
      create: {
        id: Joi.string().regex(HEIRIAL_ID_REGEX).required(),
        attributes: Joi.object().keys({
          data: Joi.object().required(),
          event_tag: Joi.string().required(),
          load_uid: Joi.string().regex(HEIRIAL_ID_REGEX).required(),
          site_uid: Joi.string().regex(HEIRIAL_ID_REGEX).required(),
          sourceIp: Joi.string().regex(IP_REGEX),
          state: Joi.string().regex(HEIRIAL_STATE_REGEX).required(),
          timestamp: Joi.date().iso(),
          uid: Joi.string().required(),
          userAgent: Joi.string(),
          visit_uid: Joi.string().regex(HEIRIAL_ID_REGEX),
          visitor_uid: Joi.string().regex(HEIRIAL_ID_REGEX),
        }),
      },
    };
  }

  create(id, attributes) {
    const currentTime = new Date();

    return this.database.raw(`
      ?
      ON DUPLICATE KEY UPDATE 
        data = IF(created_at < VALUES(created_at), 
          VALUES(data), 
          data), 
        created_at = IF(created_at < VALUES(created_at), 
          VALUES(created_at), 
          created_at)
    `, this.database('events').insert({
      created_at: currentTime.toISOString(),
      data: JSON.stringify(attributes.data),
      event_uid: attributes.load_uid || attributes.state.split('::')[2],
      site_uid: attributes.site_uid,
      type_id: EVENT_TYPE_MAP[attributes.event_tag],
      uid: id,
      visit_uid: attributes.visit_uid || attributes.state.split('::')[1],
      visitor_uid: attributes.visitor_uid || attributes.state.split('::')[0],
    }));
  }
}

module.exports = Event;
