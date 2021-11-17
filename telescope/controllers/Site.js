const Joi = require('joi');
const parseDomain = require('parse-domain');
const uuid = require('uuid/v4');
const { Controller } = require('../../lib/capsule/capsule');
const AuthenticationException = require('../exceptions/AuthenticationException');
const DuplicateResourceException = require('../exceptions/DuplicateResourceException');
const ResourceNotFoundException = require('../exceptions/ResourceNotFoundException');

const { DOMAIN_REGEX, HEIRIAL_ID_REGEX, SITE_NAME_REGEX } = require('../config');

const formatSiteResponse = (site) => {
  const attributes = site;
  delete attributes.organization_id;

  return Object.assign({}, attributes, {
    id: site.uid,
    amp_base_config: JSON.parse(site.amp_base_config),
  });
};

class Site extends Controller {
  constructor(database, authFactory) {
    super(['database', 'query']);

    this.database = database;
    this.userAuthorizerFactory = authFactory;

    this.schema = {
      index: {},
      verify: {
        id: Joi.string().regex(HEIRIAL_ID_REGEX).required(),
        url: Joi.string().required(),
      },
      create: {
        attributes: Joi.object().required().keys({
          name: Joi.string().regex(SITE_NAME_REGEX).required(),
          domain: Joi.string().regex(DOMAIN_REGEX).required(),
          is_hipaa: Joi.boolean().default(false),
        }),
      },
      read: {
        id: Joi.string().regex(HEIRIAL_ID_REGEX).required(),
      },
      update: {
        id: Joi.string().regex(HEIRIAL_ID_REGEX).required(),
        attributes: Joi.object().required().keys({
          name: Joi.string().regex(SITE_NAME_REGEX),
          domain: Joi.string().regex(DOMAIN_REGEX),
        }).or('name', 'domain'),
      },
    };
  }

  index() {
    return this.database('sites')
      .then(results => results.map(formatSiteResponse));
  }

  verify(id, url) {
    const parsedURL = parseDomain(url);
    let domain;

    if (!parsedURL.subdomain || parsedURL.subdomain === 'www') {
      domain = `${parsedURL.domain}.${parsedURL.tld}`;
    } else {
      domain = `${parsedURL.subdomain}.${parsedURL.domain}.${parsedURL.tld}`;
    }

    return this.database('sites')
      .where('uid', id)
      .andWhere(() => {
        this.where('domain', domain).orWhere('domain', `*.${domain}`);
      })
      .select('uid')
      .first()
      .then((results) => {
        if (!results.length) {
          // eslint-disable-next-line
          console.warn(`Site "${domain}" is not a valid intake source`);

          throw new AuthenticationException();
        }

        return results[0].uid;
      })
      .catch((err) => {
        // eslint-disable-next-line
        console.error(err);

        throw new AuthenticationException();
      });
  }

  // TODO: Add a method of verifying site ownership and confirm on creation
  create(attributes) {
    const parsedDomain = parseDomain(attributes.domain);
    const uid = uuid();
    let { domain } = attributes;

    if (parsedDomain.subdomain && parsedDomain.subdomain === 'www') {
      domain = `${parsedDomain.domain}.${parsedDomain.tld}`;
    }

    return this.database('sites')
      .insert(Object.assign({}, attributes, {
        domain,
        uid,
        slug: attributes.name.toLowerCase().replace(/\s+/g, '-'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      .catch((err) => {
        if (err.toString().indexOf('ER_DUP_ENTRY') > -1) {
          throw new DuplicateResourceException('Site', domain);
        }

        throw err;
      });
  }

  read(id) {
    return this.database('sites')
      .where('uid', id)
      .first()
      .then((results) => {
        if (!results.length) {
          throw new ResourceNotFoundException('Site', id);
        }

        return formatSiteResponse(results[0]);
      });
  }

  // TODO: Add a method of verifying site ownership and confirm on update
  update(id, attributes) {
    const parsedDomain = parseDomain(attributes.domain);
    let { domain } = attributes;

    if (parsedDomain.subdomain && parsedDomain.subdomain === 'www') {
      domain = `${parsedDomain.domain}.${parsedDomain.tld}`;
    }

    return this.database('sites')
      .where('uid', id)
      .update(Object.assign({}, attributes, {
        domain,
        updated_at: new Date().toISOString(),
      }))
      .catch((err) => {
        if (err.toString().indexOf('ER_DUP_ENTRY') > -1) {
          throw new DuplicateResourceException('Site', domain);
        }

        throw err;
      })
      .then(() => this.read(id));
  }
}

module.exports = Site;
