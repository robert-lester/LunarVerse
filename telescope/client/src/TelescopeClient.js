/* eslint-disable no-underscore-dangle,security/detect-object-injection,no-param-reassign,security/detect-non-literal-regexp,class-methods-use-this,consistent-return,no-undef,no-restricted-syntax,max-len */
class TelescopeClient {
  constructor(...args) {
    this.version = '1.0.0';
    this.config = Object.assign({
      ajaxTimeout: null,
      debug: false,
      events: [
        {
          selectors: 'a, button',
          name: 'click',
          tag: 'ClickEvent',
        },
      ],
      fingerprinter: {
        execute: this._defaultFingerprinter,
      },
      refresh: false,
      stage: 'live',
      tabPersistenceTimeout: 750,
      useBeacons: true,
    }, ...args);
    this.stateFields = ['telescope.uid', 'telescope.vid', 'telescope.lid'];
    this.stateFieldSeparator = '::';

    this._log = new TelescopeClientLogger('TelescopeClient', this.config);
    this._send = () => {};
    this.currentUrl = window.location.href;

    this.loadEventData = {
      referrer: document.referrer,
    };
    this.loadEventUid = uuid();
    this._setCookie('telescope.lid', this.loadEventUid);

    this.eventQueue = [];
    this.loadEventFired = false;
    this.newVisitTimer = false;
    this.visitUid = this._getCookie('telescope.vid');
    this._setCookie('telescope.vid', this.visitUid);

    this.visitorUid = this._getCookie('telescope.uid');

    window.Bugsnag.leaveBreadcrumb('Constructor finished', {
      cookieUid: this._getCookie('telescope.uid'),
      cookieVid: this._getCookie('telescope.vid'),
      cookieLid: this._getCookie('telescope.lid'),
      cookieFull: this._getCookie('telescope_id'),
      objectUid: this.visitorUid,
      objectVid: this.visitUid,
      objectLid: this.loadEventUid,
      objectFull: `${this.visitorUid}::${this.visitUid}::${this.loadEventUid}`,
    });
  }

  fire(...args) {
    const tag = args[0];
    const UID = this._getCookie('telescope.uid') || this.visitorUid;
    const VID = this._getCookie('telescope.vid') || this.visitUid;
    const LID = this.loadEventUid;
    let uid;
    let endpoint;

    if (this._canFire(tag) !== true) {
      return;
    }

    if (tag === 'LoadEvent') {
      uid = LID;
      endpoint = 'intake/load';
    } else {
      if (tag === 'UnloadEvent') {
        // Ensure UnloadEvents are always overwritten on the same visit
        uid = VID;
      } else {
        uid = uuid();
      }

      endpoint = 'intake/page';
    }

    const eventData = {
      uid,
      load_uid: (tag === 'LoadEvent') ? '0' : this.loadEventUid,
      state: `${UID}::${VID}::${LID}`,
      data: this._fireData(...args),
      timestamp: new Date().toISOString(),
      event_tag: tag,
    };

    if (tag !== 'LoadEvent' && !this.loadEventFired) {
      this._log(`New ${tag} queued`);

      // If the LoadEvent hasn't yet been fired, queue event to fire later
      this.eventQueue.push({
        endpoint,
        eventData,
      });
      return;
    }
    window.Bugsnag.leaveBreadcrumb('Firing event', {
      cookieUid: this._getCookie('telescope.uid'),
      cookieVid: this._getCookie('telescope.vid'),
      cookieLid: this._getCookie('telescope.lid'),
      cookieFull: this._getCookie('telescope_id'),
      objectUid: this.visitorUid,
      objectVid: this.visitUid,
      objectLid: this.loadEventUid,
      objectFull: `${this.visitorUid}::${this.visitUid}::${this.loadEventUid}`,
    });
    this._send(endpoint, eventData);
    this._log(`New ${tag}`, eventData);
  }

  attach(selectors, name, tag, data) {
    if (typeof selectors !== 'string' || typeof name !== 'string' ||
        typeof tag !== 'string') {
      return this._log('All arguments to .attach() must be strings');
    }

    const targets = document.querySelectorAll(selectors);

    // Define a ref to return to the calling context so events can be unbound
    const ref = {
      callbacks: [],
      name,
      selectors,
    };

    for (let i = 0, l = targets.length; i < l; i += 1) {
      const callback = this.fire.bind(this, tag, targets[i], data);

      ref.callbacks.push(callback);
      this._listen(targets[i], name, callback);
    }

    return ref;
  }

  detach(ref) {
    if (!ref) {
      return null;
    }

    if (!ref.selectors || !ref.name || !ref.callbacks ||
        typeof ref.selectors !== 'string' || typeof ref.name !== 'string' ||
        ref.callbacks.constructor !== Array) {
      return this._log('Bad reference passed to .detach()');
    } else if (!ref.callbacks.length) {
      this._log('This reference has no bound callbacks');

      return ref;
    }

    const targets = document.querySelectorAll(ref.selectors);

    // Unbind each targeted element in the passed ref
    for (let i = 0, l = targets.length; i < l; i += 1) {
      if (document.removeEventListener) {
        targets[i].removeEventListener(ref.name, ref.callbacks.shift());
      } else {
        targets[i].detachEvent(`on${ref.name}`, ref.callbacks.shift());
      }
    }

    return ref;
  }

  _getIntakeUrl() {
    if (this.config.stage === 'live') {
      // Ensure that the client will always point to the right API version
      return 'https://api.heirial.com/v2';
    }

    if (this.config.stage === 'staging') {
      return 'https://api.heirial.com/staging';
    }

    // Full URL for local testing
    return this.config.stage;
  }

  _init() {
    if (!navigator.cookieEnabled) {
      window.Bugsnag.leaveBreadcrumb('Cookies disabled...');
      return this._log('Cookies are disabled');
    }
    // The document does not have to be loaded, but the DOM must be interactive
    if (document.readyState !== 'loading') {
      this._load();
    } else {
      this._listen(window, 'load', this._load.bind(this));
    }
  }

  _listen(element, eventName, callback) {
    window.Bugsnag.leaveBreadcrumb(`Adding event listener for ${eventName}`);

    if (document.addEventListener) {
      element.addEventListener(eventName, callback);
    } else {
      // IE8 fallback
      element.attachEvent(`on${eventName}`, callback);
    }
  }

  _syncTabVisits(evt) {
    // IE8 fix
    if (!evt) {
      evt = window.event;
    }

    if (!evt.newValue) {
      return;
    }

    if (evt.key === 'requestVisitUID') {
      this._log('Another tab requested the visit UID');

      if (this.visitUid === null) {
        this._log('Aborted sending empty visit UID');
      } else {
        localStorage.setItem('sendVisitUID', this.visitUid);
        localStorage.removeItem('sendVisitUID');
      }
    } else if (evt.key === 'sendVisitUID' &&
               this.visitUid === null) {
      // If the timer hasn't been cleared, the response was fast enough
      if (this.newVisitTimer) {
        this._log('Another tab sent the visit UID');

        this.visitUid = evt.newValue;
        this._setCookie('telescope.vid', this.visitUid);
        // Clear the timer so a new visit UID is not generated
        clearTimeout(this.newVisitTimer);

        this._fireLoadEvent();
      }
    }
  }

  _load() {
    this._send = new TelescopeAjaxInterface(this._getIntakeUrl(), this.config);

    this._normalizeVisitor();
    this._bindEvents();
    this._getVisitUID();

    const UID = this._getCookie('telescope.uid') || this.visitorUid;
    const VID = this._getCookie('telescope.vid') || this.visitUid;
    const LID = this.loadEventUid;
    this.state = `${UID}::${VID}::${LID}`;

    if (document.createEventObject) {
      // dispatch for IE
      const evt = document.createEventObject();
      return document.fireEvent('ontelescope:done', evt);
    }
    // dispatch for firefox + others
    const evt = document.createEvent('HTMLEvents');
    evt.initEvent('telescope:done', true, true); // event type,bubbling,cancelable
    return !document.dispatchEvent(evt);
  }

  _normalizeVisitor() {
    // If there is no version cookie, assume version 1.0.0
    const oldVer = this._getCookie('telescope.ver') || '1.0.0';
    let oldUID = this._getCookie('telescope.uid');
    let newUID = this._getCookie('telescope.uid');

    if (!oldUID && !newUID) {
      newUID = uuid();

      this._log(`New visitor "${newUID}"`);
    } else if (this.config.refresh || !newUID || oldVer !== this.version) {
      // On refresh, always migrate oldUID to newUID, even if the same version
      // If there is no newUID but there is an oldUID, migrate oldUID to newUID
      // If there is a newUID, the versions are different so swap and migrate
      if (newUID) {
        oldUID = newUID;
      }

      newUID = uuid();
      this._migrateVisitor(oldVer, oldUID, newUID);
    }

    // Whether or not they've been updated, the UID and version are now correct
    this.visitorUid = newUID;
    this._setCookie('telescope.uid', newUID);
    this._setCookie('telescope.ver', this.version);
  }

  _getCookie(key) {
    const fieldIndex = this.stateFields.indexOf(key);
    let match;

    if (fieldIndex > -1 || key === 'telescope.*') {
      match = document.cookie.match(new RegExp('telescope=([^\\s;]*)'));

      if (!key || !match) {
        return ['', '', ''];
      }

      if (key === 'telescope.*') {
        return unescape(match[1]).split(this.stateFieldSeparator);
      }

      return unescape(match[1]).split(this.stateFieldSeparator)[fieldIndex] || '';
    }

    match = document.cookie.match(new RegExp(`${key}=([^\\s;]*)`));

    return key && match ? unescape(match[1]) : '';
  }

  _setCookie(key, value) {
    window.Bugsnag.leaveBreadcrumb(`Pre-cookie update: ${key}`, {
      cookieUid: this._getCookie('telescope.uid'),
      cookieVid: this._getCookie('telescope.vid'),
      cookieLid: this._getCookie('telescope.lid'),
      cookieFull: this._getCookie('telescope_id'),
      objectUid: this.visitorUid,
      objectVid: this.visitUid,
      objectLid: this.loadEventUid,
      objectFull: `${this.visitorUid}::${this.visitUid}::${this.loadEventUid}`,
    });

    if (key === 'telecope.vid') {
      const isIE = (navigator.userAgent.indexOf('MSIE') > -1);
      if (!isIE) {
        document.cookie = `telescope.vid=${value}; expires=0; path=/`;
      } else {
        document.cookie = `telescope.vid=${value}; path=/`;
      }

      const fieldIndex = this.stateFields.indexOf(key);
      if (fieldIndex > -1) {
        const cookieFields = this._getCookie('telescope.*');
        cookieFields[fieldIndex] = value;
        document.cookie = `telescope_id=${cookieFields.join(this.stateFieldSeparator)}; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/`;
      }
    } else {
      const fieldIndex = this.stateFields.indexOf(key);
      if (fieldIndex > -1) {
        const cookieFields = this._getCookie('telescope.*');
        cookieFields[fieldIndex] = value;
        document.cookie = `telescope_id=${cookieFields.join(this.stateFieldSeparator)}; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/`;
      }
      document.cookie = `${key}=${value}; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/`;
    }

    window.Bugsnag.leaveBreadcrumb(`Post-cookie update: ${key}`, {
      cookieUid: this._getCookie('telescope.uid'),
      cookieVid: this._getCookie('telescope.vid'),
      cookieLid: this._getCookie('telescope.lid'),
      cookieFull: this._getCookie('telescope_id'),
      objectUid: this.visitorUid,
      objectVid: this.visitUid,
      objectLid: this.loadEventUid,
      objectFull: `${this.visitorUid}::${this.visitUid}::${this.loadEventUid}`,
    });
  }

  _migrateVisitor(oldVer, oldUID, newUID) {
    const method = this.config.refresh ? 'Manual' : 'Automatic';

    // If there was no saved version cookie, the migrator assumes 1.0.0
    this._send('map', {
      data: {
        current_url: this.currentUrl,
      },
      reason: `${method} migration from ${oldVer} to ${this.version}`,
      uid_1: oldUID,
      uid_2: newUID,
    });

    this._log(`Visitor ${oldUID} migrated to ${newUID}`);
  }

  _parseDomain() {
    const urlParts = this._parseHost(window.location.href).split('.');

    // Remove subdomains until only host with TLD is remaining
    while (urlParts.length > 2) {
      urlParts.shift();
    }

    return urlParts.join('.');
  }

  _parseHost(url) {
    // Remove the protocol and path
    return url.indexOf('://') > -1 ? url.split('/')[2] : url.split('/')[0];
  }

  _getVisitUID() {
    this._getVisitUIDWithoutTabs();
  }

  _getVisitUIDWithoutTabs() {
    if (!this.config.refresh && this.visitUid && !this._isNewVisit()) {
      // There is already a visit UID, do not request or generate one
      this._fireLoadEvent();
    } else {
      this.visitUid = uuid();
      this._setCookie('telescope.vid', this.visitUid);
      this._fireLoadEvent();
    }
  }

  _getVisitUIDWithTabs() {
    if (!this.config.refresh && this.visitUid) {
      // There is already a visit UID, do not request or generate one
      this._fireLoadEvent();
    } else {
      // Request a visit UID from any other open tabs
      localStorage.setItem('requestVisitUID', 1);
      localStorage.removeItem('requestVisitUID');

      // Give other tabs some time to respond; if one does, cancel the timer
      this.newVisitTimer = setTimeout(() => {
        if (this._isNewVisit()) {
          this.visitUid = uuid();
          this._setCookie('telescope.vid', this.visitUid);

          this._log(`New visit "${this.visitUID}"`);
          // Prevent the other tabs from returning the visit UID after the fact
          this.newVisitTimer = false;
          return this._loadFingerprinter();
        }

        this._fireLoadEvent();
      }, this.config.tabPersistenceTimeout);
    }
  }

  _fireLoadEvent() {
    const getVars = this._normalizeQueryVars();
    const visitUid = this._getCookie('telescope.vid') || this.visitUid;

    if (!Object.isEmpty(getVars)) {
      this.loadEventData.get_vars = getVars;
    }

    this.fire('LoadEvent', this.loadEventData);
    // Prevent any other LoadEvents from being fired
    this.loadEventFired = true;

    // Fire all events that were queued before the initial LoadEvent
    while (this.eventQueue.length) {
      const event = this.eventQueue.shift();
      event.eventData.visit_uid = visitUid;

      this._log(`Queued ${event.eventData.event_tag}`, event.eventData);
      this._send(event.endpoint, event.eventData);
    }
  }

  _normalizeQueryVars() {
    // Merge the GET arrays together, overwriting referrer vars with url vars
    return Object.assign(
      {},
      this._parseQueryVars(this.loadEventData.referrer),
      this._parseQueryVars(this.currentUrl),
    );
  }

  _parseQueryVars(url) {
    const queryString = this._parseQueryString(url);
    const queryParams = queryString.split('&');
    const getVars = {};

    for (let i = 0, l = queryParams.length; i < l; i += 1) {
      const keyVal = queryParams[i].split('=');
      const key = decodeURIComponent(keyVal[0]);

      keyVal.shift();

      // If there are multiple '=' in the variable, treat extras as literals
      // If there is no value, it should be true by default
      const val = keyVal.join('=') || 'true';

      // If the key is already in the object, turn it into an array of values
      if (key in getVars) {
        if (!(getVars[key] instanceof Array)) {
          getVars[key] = [getVars[key]];
        }

        getVars[key].push(decodeURIComponent(val));
      } else if (key !== '') {
        getVars[key] = decodeURIComponent(val);
      }
    }

    return getVars;
  }

  _parseQueryString(url) {
    const queryIndex = url.indexOf('?');

    if (queryIndex < 0) {
      return '';
    }

    let queryString = url.substring(queryIndex + 1);

    // Exclude anything after the hash
    if (queryString.indexOf('#') > -1) {
      [queryString] = queryString.split('#');
    }

    return queryString;
  }

  _bindEvents() {
    // Run through each of the constructed events and attach them
    for (let i = 0; i < this.config.events.length; i += 1) {
      const event = this.config.events[i];

      this.config.events[i].ref = this.attach(event.selectors, event.name, event.tag);
    }

    this._listen(window, 'beforeunload', this._unload.bind(this));
  }

  _unload() {
    // Remove all of the constructed event listeners
    for (let i = 0; i < this.config.events.length; i += 1) {
      this.detach(this.config.events[i].ref);
    }

    // Prevent setting sessionStorage after unload
    clearTimeout(this.newVisitTimer);
    this.fire('UnloadEvent');
  }

  _isNewVisit() {
    // If there is no visit UID or the referrer is external, it's a new visit
    if (this.config.refresh || !this._getCookie('telescope.vid') ||
        this._parseHost(this.currentUrl) !== this._parseHost(this.loadEventData.referrer)) {
      return true;
    }

    return false;
  }

  _loadFingerprinter() {
    if (typeof this.config.fingerprinter.execute === 'function') {
      if (typeof this.config.fingerprinter.script === 'string') {
        // If the fingerprinter requires source code, load it before executing
        return this._loadAsync(
          this.config.fingerprinter.script,
          this._executeFingerprinter.bind(this),
        );
      } else if (!this.config.fingerprinter.script) {
        // Otherwise, execute it immediately
        return this._executeFingerprinter();
      }
    }

    this._log('The fingerprinter is invalid');
    // Fire the LoadEvent without a fingerprint
    this._fireLoadEvent();
  }

  _loadAsync(url, callback) {
    const as = document.createElement('script');
    as.type = 'text/javascript';
    as.async = true;
    as.src = url;

    if (as.readyState) {
      // IE fix
      as.onreadystatechange = () => {
        if (as.readyState === 'loaded' || as.readyState === 'complete') {
          // Prevent duplicate state change callbacks
          as.onreadystatechange = null;

          callback();
        }
      };
    } else {
      // Normal browsers
      this._listen(as, 'load', callback);
    }

    // Add the script to the document
    document.body.insertBefore(as, null);
  }

  _executeFingerprinter() {
    let dataPoints = '';
    let fingerprint;

    try {
      fingerprint = this.config.fingerprinter.execute() || {};
    } catch (e) {
      this._log(`Fingerprinter error: ${e}`);

      return this._fireLoadEvent();
    }

    if (Object.isEmpty(fingerprint)) {
      this._log('The fingerprinter returned an empty hash');
    } else {
      delete fingerprint.id;

      // Build datapoints to hash together into a unique fingerprint ID
      for (const key in fingerprint) {
        if (typeof fingerprint[key] === 'string') {
          dataPoints += fingerprint[key];
        } else {
          dataPoints += JSON.stringify(fingerprint[key]);
        }
      }

      this.loadEventData.fingerprint = Object.assign({}, fingerprint, {
        id: murmurhash(dataPoints, 256),
      });
    }

    // Fire the LoadEvent with attached fingerprint (finally)
    this._fireLoadEvent();
  }

  _defaultFingerprinter() {
    return {
      user_agent: navigator.userAgent,
    };
  }

  _canFire(tag) {
    if (!navigator.cookieEnabled) {
      return this._log('Cookies are disabled');
    }

    // This prevents clickpaths from becoming desynchronized
    if (tag === 'LoadEvent' && this.loadEventFired) {
      return this._log('A LoadEvent has already been fired');
    }

    return true;
  }

  _fireData(...args) {
    // All events need a current_url for auth purposes
    const data = {
      current_url: this.currentUrl,
    };

    // No data
    if (args.length < 2 || !args[1]) {
      return data;
    }

    if (args[1].nodeType && args[1].nodeType === 1) {
      // The second arg is an HTMLElement so parse it
      const elementData = this._elementData(args[1]);

      // If the third arg is data, merge it in; otherwise, only merge element
      return Object.assign({ element: elementData }, args[2] || {}, data);
    } else if (typeof args[1] !== 'object') {
      this._log('The second fire argument is invalid');

      return data;
    }

    // If the second arg is not an HTMLElement, it must be data so merge it in
    return Object.assign(args[1], data);
  }

  _elementData(element) {
    const attributes = {};

    // Extract all HTML attributes from the DOM element
    for (let i = 0, l = element.attributes.length; i < l; i += 1) {
      attributes[element.attributes[i].name] = element.attributes[i].value;
    }

    return {
      attributes,
      // Use regex to remove nested HTML elements from inside the tag
      text: element.innerHTML.replace(/(<([^>]+)>)/ig, '').trim(),
      html: element.outerHTML,
    };
  }
}

if (!window.telescope) {
  window.telescope = new TelescopeClient(window.telescopeConfig);
  window.telescope._init();
}
