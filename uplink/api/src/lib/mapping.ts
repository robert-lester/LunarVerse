/**
 * Checks if the 2 dates are on the same day
 * @param date1 First date to check
 * @param date2 Second date to check
 */
export function sameDay(date1: string | number, date2: string | number): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d2.getFullYear() === d1.getFullYear() &&
    d2.getMonth() === d1.getMonth() &&
    d2.getDate() === d1.getDate()
  );
}

/**
 * Checks if the supplied date is within the specified date range
 * @param initial Starting date to check against
 * @param final End date to check against
 * @param check Date to check
 */
export function withinDateRange(
  initial: string | number,
  final: string | number,
  check: string | number,
): boolean {
  const from = new Date(initial).setHours(0, 0, 0, 0);
  const to = new Date(final).setHours(23, 59, 59, 999);
  const test = new Date(check).getTime();
  return test <= to && test >= from;
}

/**
 * Merges object and object properties
 * @param objs Array of objects to merge
 */
export function mergeObj(...objs): any {
  return [...objs].reduce(
    (acc: any, obj: any) =>
      Object.keys(obj).reduce((a, k) => {
        acc[k] = acc.hasOwnProperty(k) ? { ...acc[k], ...obj[k] } : obj[k];
        return acc;
      }, {}),
    {},
  );
}

/**
 * @method mapify
 * @description Creates a dictionary with two way bindings, reverse mapping, between keys and values
 * @param original {enum<string|number, string|number>} - the enum to convert into a map
 * @example
 * ``ts
 *
 * enum ExampleEnumNumber {
 *   BAZ_ERROR = 1
 * }
 *
 * enum ExampleEnumString {
 *   BAZ_ERROR = `Value was BAR`
 * }
 *
 * // Enums with values that are numbers reverse map as expected
 * ExampleEnumNumber.BAZ_ERROR // returns 1
 * ExampleEnumNumber[1] would  // returns 'BAZ_ERROR'
 *
 * // Enums with values that are strings don't reverse map
 * ExampleEnumString.BAZ_ERROR        // returns `Value was BAR`
 * ExampleEnumString[`Value was BAR`] // returns undefined
 *
 * // This method solves this by converting Enums that have values that are strings to object maps from them that supports reverse mapping.
 *
 * // A map object for our example would produce a map that looks like this
 * const exampleMap = mapify(ExampleEnumString)
 *
 * // Is the same as manually typing
 * const exampleMap{
 *  `BAZ_ERROR`: `Value was BAR`,
 *  `Value was BAR`: `BAZ_ERROR`
 * };
 *
 * // Which creates our reverse map so we can access they key by the value
 * ExampleEnumString.BAZ_ERROR        // returns `Value was BAR`
 * ExampleEnumString[`Value was BAR`] // returns `BAZ_ERROR`
 *
 * ``
 * @returns result {object} - Enum to Map that supports reverse mapping
 */
export function mapify(original: object){
      const result = Object
          .keys(original)
          .reduce((acc = {}, curr) => {
            const value = original[curr];

            acc[curr] = value;
            acc[value] = curr;
            return acc;
          }, {});
      return result;
}
