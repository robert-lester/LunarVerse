/* eslint-disable security/detect-object-injection */
const Joi = require('joi');
const ua = require('ua-parser-js');
const { Controller } = require('../../lib/capsule/capsule');
const { DEFAULT_FINGERPRINT, HEIRIAL_ID_REGEX } = require('../config');
const ResourceNotFoundException = require('../exceptions/ResourceNotFoundException');

const buildEventComplexPath = (event) => {
  const newEvent = event;

  newEvent.data = JSON.parse(newEvent.data);

  switch (newEvent.type_id) {
    case 1: // Load
      if (newEvent.data.current_url) {
        return newEvent.data.current_url.replace(/http.?:\/\/www\..+?\.(com|org|net)/, '');
      }
      return '';
    case 2: // Unload
      if (newEvent.data.current_url) {
        return newEvent.data.current_url.replace(/http.?:\/\/www\..+?\.(com|org|net)/, 'Unload - ');
      }
      return '';
    case 3:
      if (newEvent.data.current_url && (newEvent.data.element || {}).html) {
        return `Click (<${newEvent.data.element.html.replace(/"/g, "'")}>) - ${newEvent.data.current_url.replace(/http.?:\/\/www\..+\.(com|org)/, '')}`;
      }
      return `Click (<${newEvent.data.element.html.replace(/"/g, "'")}>)`;
    case 4:
      return 'Form Fillout';
    case 5:
      if (newEvent.data.current_url) {
        return newEvent.data.current_url.replace(/http.?:\/\/www\..+?\.(com|org|net)/, 'Phone Call');
      }
      return 'Phone Call';
    case 6:
      if (newEvent.data.current_url) {
        return newEvent.data.current_url.replace(/http.?:\/\/www\..+?\.(com|org|net)/, 'Chat');
      }
      return 'Chat';
    default:
      // eslint-disable-next-line
      console.error(`Invalid event type ID "${newEvent.type_id}"`);

      return '';
  }
};

const mapVisitorEventsToVisits = (events) => {
  const visits = [];
  let currentVisitId;
  let currentVisitIndex = -1;

  events.forEach((event) => {
    if (currentVisitId !== event.visit_uid) {
      currentVisitId = event.visit_uid;
      currentVisitIndex += 1;

      visits[currentVisitIndex] = event;
      visits[currentVisitIndex].click_path = [];
    }

    const eventPath = buildEventComplexPath(event);

    visits[currentVisitIndex].click_path.push(eventPath);
  });

  return visits;
};

const buildFingerprint = (event) => {
  let fingerprint = event.fingerprint || {};

  try {
    if (typeof fingerprint === 'string') {
      fingerprint = JSON.parse(fingerprint);
    }

    if (!fingerprint.user_agent) {
      if (fingerprint.user_agent_server) {
        fingerprint.user_agent = fingerprint.user_agent_server;
      } else if (event.data.user_agent) {
        fingerprint.user_agent = event.data.user_agent;
      } else if (event.data.user_agent_server) {
        fingerprint.user_agent = event.data.user_agent_server;
      }
    }

    delete fingerprint.user_agent_server;

    if (fingerprint.user_agent) {
      const userAgent = ua(fingerprint.user_agent);

      fingerprint = Object.assign(fingerprint, {
        browser: userAgent.browser.name || '',
        browser_version: userAgent.browser.version || '',
        device: userAgent.device.type || 'Desktop',
        os: userAgent.os.name || '',
        os_version: userAgent.os.version || '',
      });
    } else {
      fingerprint = Object.assign(DEFAULT_FINGERPRINT, fingerprint);
    }
  } catch (err) {
    // eslint-disable-next-line
    console.error('Fingerprinting error', err);

    fingerprint = DEFAULT_FINGERPRINT;
  }

  return fingerprint;
};

const formatVisitorVisitResponse = visits => visits.map((visit) => {
  const formattedVisit = visit;

  formattedVisit.formatted_path = `[${visit.click_path.join(']-[')}]`;
  formattedVisit.fingerprint = buildFingerprint(visit);

  if (!formattedVisit.fingerprint.ip_address && visit.data.ip_address) {
    formattedVisit.fingerprint.ip_address = visit.data.ip_address;

    delete formattedVisit.data.ip_address;
    delete formattedVisit.data.user_agent;
    delete formattedVisit.data.user_agent_server;
  }

  return formattedVisit;
}).reverse();

const formatVisitResponse = (events) => {
  const clickPath = [];
  const firstEvent = events[events.length - 1];
  const parseData = JSON.parse(firstEvent.data);

  events.forEach((event) => {
    const str = buildEventComplexPath(event);

    clickPath.push(str);
  });

  return {
    visitor_uid: firstEvent.visitor_uid,
    visit_uid: firstEvent.visit_uid,
    site_uid: firstEvent.site_uid,
    type_id: firstEvent.type_id >= 4 ? firstEvent.type_id : 1,
    data: {
      referrer: parseData.referrer,
      get_vars: parseData.get_vars || {},
    },
    fingerprint: buildFingerprint(firstEvent),
    ip_address: parseData.ip_address,
    click_path: clickPath,
    formatted_path: `[${clickPath.join(']-[')}]`,
    first_event: firstEvent.created_at,
    last_event: events[0].created_at,
    raw_visit_data: events.reverse(),
  };
};

class Visit extends Controller {
  constructor(database, authController, authFactory) {
    super(['database', 'query']);

    this.database = database;
    this.authController = authController;
    this.userAuthorizerFactory = authFactory;

    this.schema = {
      visitorIndex: Joi.object().keys({
        visitorId: Joi.string().regex(HEIRIAL_ID_REGEX).required(),
        params: Joi.object().keys({
          complex: Joi.boolean().default(false),
          count: Joi.number().default(100),
          mostRecent: Joi.boolean().default(false),
        }),
      }),
      read: Joi.object().keys({
        id: Joi.string().regex(HEIRIAL_ID_REGEX).required(),
        params: Joi.object().keys({
          complex: Joi.boolean().default(false),
        }),
      }),
    };
  }

  visitorIndex(visitorId, params) {
    const { count, mostRecent, complex } = params;
    const typeConstraint = complex ? '' : ' AND type_id = 1';

    return this.database.raw(`
      SELECT *
      FROM events
      INNER JOIN(
        SELECT uid, v.fingerprint
        FROM events, (
          SELECT fingerprint
          FROM visitors
          INNER JOIN sites ON visitors.site_uid = sites.uid
          WHERE visitors.uid = ?
        ) v
        WHERE visit_uid IS NOT NULL AND visitor_uid = ?${typeConstraint}
        ORDER BY created_at ASC
      ) AS output USING(uid)
      ORDER BY events.created_at ASC
      LIMIT ?
    `, [visitorId, visitorId, count])
      .then(mapVisitorEventsToVisits)
      .then(formatVisitorVisitResponse)
      .then((visits) => {
        if (mostRecent) {
          return visits[0];
        }

        return visits;
      });
  }

  read(id, params) {
    const { complex } = params;
    const typeConstraint = complex ? '' : ' AND type_id = 1';

    return this.database.raw(`
      SELECT *
      FROM events
      INNER JOIN(
        SELECT uid, visitor_uid, v.fingerprint
        FROM events, (
          SELECT fingerprint
          FROM visitors
          INNER JOIN sites ON visitors.site_uid = sites.uid
          AND visitors.uid = (
            SELECT visitor_uid
            FROM events
            WHERE visit_uid = ? AND type_id = 1
            LIMIT 1
          )
        ) AS v
        WHERE visit_uid = ?${typeConstraint}
      ) AS output USING(uid)
      ORDER BY created_AT DESC
    `, [id, id])
      .then((events) => {
        if (!events.length || !events[0].length) {
          throw new ResourceNotFoundException('Visit', id);
        }

        return formatVisitResponse(events[0]);
      });
  }
}

module.exports = Visit;
