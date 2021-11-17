/**
 * Manages the lifecycle for dependencies and passes them to a function context
 * @param {array} dependencies An array of dependencies which are passed in order to the context
 * @param {function} teardown A function to tear down the dependencies at the end of their lifecycle
 * @returns {function} A function that takes a context and provides it with the dependencies
 */
const Ellipse = (dependencies, teardown) => {
  let contextDepth = 0;
  let resolved = false;

  if (!Array.isArray(dependencies)) {
    throw new TypeError('Cannot create lifecycle - dependencies must be an array');
  }

  if (!dependencies.length) {
    // eslint-disable-next-line
    console.warn('No dependencies to provide to context');
  }

  if (typeof teardown !== 'function') {
    throw new TypeError('Cannot create lifecycle - teardown must be a function');
  }

  /**
   * Tear down the dependencies, ensuring they are only torn down once
   */
  const safeTeardown = async () => {
    contextDepth -= 1;

    if (resolved) {
      throw new Error('This dependency context has already been resolved');
    } else if (contextDepth <= 0) {
      await teardown(...dependencies);
      resolved = true;
    }
  };

  /**
   * Take in a context, provide it with dependencies, and tear them down after it runs
   * @param {function} context A context function
   * @returns {any} The result that the context returned
   */
  return async (context) => {
    if (typeof context !== 'function') {
      throw new TypeError('Invalid context - context must be a function');
    }
    contextDepth += 1;

    try {
      const result = await context(...dependencies);
      await safeTeardown();
      return result;
    } catch (err) {
      await safeTeardown();
      throw err;
    }
  };
};

module.exports = Ellipse;
