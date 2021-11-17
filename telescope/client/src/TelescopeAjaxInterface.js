/* eslint-disable no-unused-vars,no-underscore-dangle,no-restricted-globals,no-undef */
class TelescopeAjaxInterface {
  constructor(intakeURL, config = {}) {
    this._allowBeacons = config.allowBeacons;
    this._intakeURL = String(intakeURL);
    this._timeout = parseInt(config.ajaxTimeout, 10) || null;

    this._log = new TelescopeClientLogger('TelescopeAjaxInterface', config);

    return this._getSendingMethod();
  }

  _getSendingMethod() {
    if (location.protocol !== 'http:' && location.protocol !== 'https:') {
      this._log('Error: The Telescope Client must be served over HTTP(S)');
    } else if (this._allowBeacons && navigator.sendBeacon) {
      return this._sendBeacon.bind(this);
    } else if ('withCredentials' in new XMLHttpRequest()) {
      return this._sendXHR.bind(this);
    } else if (typeof XDomainRequest !== 'undefined') {
      return this._sendXDR.bind(this);
    } else {
      this._log('This browser does not support AJAX');
    }

    // Return an empty function so calling _send() will still fail gracefully
    return () => {};
  }

  _sendBeacon(endpoint, data) {
    const response = navigator.sendBeacon(`${this._intakeURL}/${endpoint}`, JSON.stringify(data));

    if (!response) {
      this._log('The browser failed to queue the AJAX beacon');
      return;
    }
    this._log('AJAX beacon sent');
  }

  _sendXHR(endpoint, data) {
    const xhr = new XMLHttpRequest();

    xhr.open('post', `${this._intakeURL}/${endpoint}`, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('charset', 'utf-8');

    if (this._timeout !== null) {
      xhr.timeout = this._timeout;
      xhr.ontimeout = () => {
        this._ajaxResponse(504, 'Request timed out');
      };
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status > 0 && xhr.responseText) {
        this._ajaxResponse(xhr.status, xhr.responseText);
      }
    };

    xhr.send(JSON.stringify(data));
  }

  _sendXDR(endpoint, data) {
    const xdr = new XDomainRequest();

    xdr.onload = () => {
      this._ajaxResponse(200, xdr.responseText);
    };

    xdr.onerror = () => {
      this._ajaxResponse(400, xdr.responseText);
    };

    xdr.ontimeout = () => {
      this._ajaxResponse(504, 'Request timed out');
    };

    if (this._timeout !== null) {
      xdr.timeout = this._timeout;
    }

    // All events must have handlers for IE10
    xdr.onprogress = () => {};
    xdr.open('post', `${this._intakeURL}/${endpoint}`, true);

    // Timeout required to fix another IE10 bug
    setTimeout(() => {
      xdr.send(JSON.stringify(data));
    }, 0);
  }

  _ajaxResponse(statusCode, responseText = '') {
    if (responseText !== '') {
      this._log(`Response [${statusCode}]: ${responseText}`);
    }
  }
}
