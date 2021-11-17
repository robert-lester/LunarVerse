const strict = require('./strict');

const name = 'words';
/**
 * Slice the words from the string, using a 1-based indexing system
 * @param {string} str The incoming word string
 * @param {string} from The 1-based index to start at. If negative, start from the end
 * @param {string} to The 1-based index to end at. If negative, start from the end
 * @returns {string} The sliced words, re-joined by spaces
 */
const func = (str, from, to) => {
  const finalFrom = parseInt(from, 10);
  const finalTo = parseInt(to, 10);

  if (Number.isNaN(finalFrom) || finalFrom.toString().length !== from.toString().length) {
    throw new TypeError(`Expected "from" to be a number, got "${from}"`);
  }

  if (typeof to !== 'undefined' && to !== '' && (Number.isNaN(finalTo) || finalTo.toString().length !== to.toString().length)) {
    throw new TypeError(`Expected "to" to be a number, got "${to}"`);
  }

  if (typeof to === 'undefined' || to === '') {
    return str.split(/\s+/).slice(finalFrom < 0 ? finalFrom : finalFrom - 1).join(' ');
  }

  return str.split(/\s+/).slice(finalFrom < 0 ? finalFrom : finalFrom - 1, finalTo < 0 ? finalTo + 1 : finalTo).join(' ');
};

module.exports = {
  func: strict(func, 2),
  name,
};
