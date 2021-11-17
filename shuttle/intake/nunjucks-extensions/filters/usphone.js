/* eslint-disable security/detect-object-injection */
const strict = require('./strict');

const presets = {
  Dashes: 'NNN-NNN-NNNN',
  Domestic: '(NNN) NNN-NNNN',
  'E.164': '+1NNNNNNNNNN',
  Spaces: 'NNN NNN NNNN',
};
const name = 'us_phone';
/**
 * Formats a US phone number, substituting digits for "N" characters
 * @param {string} str The incoming phone number string
 * @param {string} format A string with "N" characters describing the output format for the number
 * @returns {string} The formatted phone number
 */
const func = (str, format = 'Domestic') => {
  if (typeof format !== 'string') {
    throw new TypeError(`Invalid format "${format}". Format must be a string`);
  }

  const finalString = str.replace(/\D/g, '').split('');
  const finalFormat = presets[format] || format;
  let output = '';

  if ((finalFormat.match(/N/g) || []).length !== finalString.length) {
    throw new Error(`Invalid phone number "${str}" for format "${format}"`);
  }

  for (let i = 0, char = finalFormat[0]; i < finalFormat.length; i += 1, char = finalFormat[i]) {
    if (char === 'N') {
      output += finalString.shift();
    } else {
      output += char;
    }
  }

  return output;
};

module.exports = {
  func: strict(func, 1),
  name,
};
