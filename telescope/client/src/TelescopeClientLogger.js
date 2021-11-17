/* eslint-disable no-unused-vars,no-underscore-dangle,no-console,no-alert,security/detect-object-injection,max-len */
class TelescopeClientLogger {
  constructor(namespace, config = {}) {
    this._namespace = `${String(namespace)} - `;
    this._debug = !!config.debug;

    return this._getLoggingMethod();
  }

  _getLoggingMethod() {
    const namespace = this._namespace;

    if (!this._debug) {
      return () => {};
    }

    // By binding the calling namespace to the logger, we ensure that it always
    // appears first in the console, telling us which class logged the message
    if (window.console && console.log.bind) {
      return console.log.bind(console, namespace);
    }
    return (...args) => {
      const newArgs = [namespace];

      for (let i = 0; i < args.length; i += 1) {
        if (typeof args[i] === 'object') {
          newArgs.push(`\n${JSON.stringify(args[i], null, '\t')}`);
        } else {
          newArgs.push(args[i]);
        }
      }
      alert(newArgs.join(' '));
    };
  }
}
