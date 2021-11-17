/**
 * Adds a toggle to strict mode on the filter, which when disabled absorbs errors silently
 * @param {object} filter A Nunjucks filter
 * @param {number} strictArg The numeric argument index which carries the strict arg for the filter
 * @returns {function} A proxy for the filter that wraps it in a try/catch to suppress errors
 */
const strict = (filter, strictArg) => (str, ...args) => {
  try {
    return filter(str, ...args);
  } catch (err) {
    // eslint-disable-next-line
    if (args.length < strictArg - 1 || (args[strictArg] !== 'false' && args[strictArg] !== false)) {
      throw err;
    }

    return str;
  }
};

module.exports = strict;
