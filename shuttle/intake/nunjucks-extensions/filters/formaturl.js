const parseDomain = require('parse-domain');
const qs = require('qs');
// TODO: Once we upgrade to Node 8, change this to:
// const { URL } = require('url');
// const parsedURL = new URL(str);
const url = require('url');
const strict = require('./strict');

const name = 'format_url';

/**
 * Formats a URL, substituting URL components for named tokens
 * @param {string} str The incoming URL string
 * @param {string} format A string with tokens describing the output format for the URL
 * @returns {string} The formatted URL
 */
const func = (str, format = '{hostname}') => {
  let parsedURL;

  if (typeof format !== 'string') {
    throw new TypeError(`Invalid format "${format}". Format must be a string`);
  }

  try {
    parsedURL = url.parse(str);
    // Legacy URL API for Node 6. Once upgraded, origin, password, and username will be built-in
    parsedURL = {
      hash: parsedURL.hash || '',
      host: parsedURL.host || '',
      hostname: parsedURL.hostname || '',
      href: parsedURL.href || '',
      origin: parsedURL.protocol && parsedURL.host ? `${parsedURL.protocol}//${parsedURL.host}` : '',
      pathname: parsedURL.pathname || '',
      port: parsedURL.port || '',
      password: parsedURL.auth && parsedURL.auth.includes(':') ? parsedURL.auth.split(':')[1] : '',
      protocol: parsedURL.protocol || '',
      search: parsedURL.search || '',
      username: parsedURL.auth ? parsedURL.auth.split(':')[0] : '',
    };

    const parsedDomain = parseDomain(parsedURL.hostname);

    if (!parsedDomain) {
      throw new Error();
    }

    // Additionally, domain parts are also supported as tokens
    parsedURL.domain = parsedDomain.domain;
    parsedURL.subdomain = parsedDomain.subdomain;
    parsedURL.tld = parsedDomain.tld;
  } catch (err) {
    throw new Error(`Invalid URL "${str}"`);
  }

  // searchParams are re-implemented as a key/value dictionary
  const query = qs.parse(parsedURL.search.slice(1));
  let output = format;

  Object.keys(parsedURL).forEach((key) => {
    // eslint-disable-next-line
    output = output.replace(`{${key}}`, parsedURL[key]);
  });

  // eslint-disable-next-line
  return output.replace(/{searchParams\.([a-zA-Z0-9-_]+)}/, (match, key) => query[key] || '');
};

module.exports = {
  func: strict(func, 1),
  name,
};
