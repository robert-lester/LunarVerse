# Telescope Client

The Telescope Client is a small piece of JavaScript code that tracks what visitors do on our sites and feeds those data back to the central Telescope application, which marketers and developers can then analyze through a front-end interface and a robust Read API.

The client is very easy to use and in many cases can be dropped onto a site without any configuration. This guide will walk you through installation, basic usage, more advanced use-cases, and how developers can contribute to Telescope's future development.

### Contents

- [Terminology](#terminology)
- [Loading the client](#loading-the-telescope-client)
- [Initializing the client](#initializing-the-telescope-client)
- [Configuring the client](#configuring-the-telescope-client)
- [Attaching and detaching event listeners](#attaching-and-detaching-event-listeners)
- [Firing events manually](#firing-events-manually)
- [Building and deploying](#building-and-deploying)

### Terminology

* Visitor: A distinct device (combination of hardware and software) that visits a site. This is **not** necessarily the same thing as a person.
* Visit: A single, unbroken visitor session on a site. A visit terminates when a visitor leaves the site (even if they come back), clears their browser cookies, or their session is [manually refreshed](#configuring-the-telescope-client).
* Event: An action which a person takes while using a device on a site. These are highly flexible but generally can be thought of as analogous to browser actions, such as clicks and page loads.
* User: A marketer or developer who uses Telescope, not to be confused with "visitor".
* Fingerprint: A unique* identifier for a visitor, generated using known device characteristics.

**Note**: Some device and browser configurations are considerably less unique than others. See [this paper](https://panopticlick.eff.org/static/browser-uniqueness.pdf) for more information.

### Loading the Telescope Client

1. If the site is not yet in Telescope, first create a site using the [GUI front-end](https://frontend.heirial.com/) or by asking a Telescope admin to make one for you.
2. Once you have a matching subdomain i.e. `abc.example.com` or a wildcard subdomain i.e. `*.example.com` in Telescope, you can put the script on your site.

*Synchronous load (faster, ~13kb initial load)*:
```html
<script src="https://cdn.belunar.com/telescope/client.min.js"></script>
```

*Asynchronous load (slower, ~200b initial load, ~13kb deferred load)*:
```html
<script>(function(){var h=document.createElement('script');h.type='text/javascript';h.async=true;h.src='https://cdn.belunar.com/telescope/client.min.js';s=document.scripts[0];s.parentNode.insertBefore(h,s);})();</script>
```

If your server is able to serve asset files that have been zipped using `gzip`, you may also use the `https://cdn.belunar.com/telescope/client.min.js.gz` script file for either of these methods (*~5kb*).

**Note**: For security reasons, the site ID will only work on the domain it is registered to. Using it on any other domain will cause an authentication error and the event data will not be sent to Telescope.

### Initializing the Telescope client

Once you've added the script to your site, the client will initialize itself automatically, either synchronously or asynchronously depending on the load method above.

Because the client initializes itself as soon as the script is loaded, it will use the default configuration unless other options are set before the client loads. You can do this by declaring an `telescopeConfig` JavaScript object prior to loading the script.

*Example*:
```html
<script>
  const telescopeConfig = {
    debug: true,
    stage: 'staging',
  };
</script>
<script src="https://cdn.belunar.com/telescope/client.dev.js"></script>
```

**Note (web/app devs)**: The above configuration is recommended for testing the Telescope Client on your site prior to using it with live visitors. Events will be sent to the staging database rather than the live one and debug info will be written to the JavaScript console. Note that using `.dev` rather than `.min` in the filename will give you the non-minified version of the code.

### Configuring the Telescope client

The `telescopeConfig` object hash any number of the following hash options:

```javascript
const telescopeConfig = {
  debug,         // (bool) If true, write debug info to the JavaScript console
  refresh,       // (bool) If true, a new visitor and visit will be created on each page load
  stage,         // (string) Which version of the API to write to. "live", "staging", or a full local API URL for testing (Serverless default is http://localhost:3000)
  fingerprinter, // (object) See "fingerprinters" below
  events,        // (array) See "events" below
};
```

#### Fingerprinters

See [Terminology](#terminology)

These `fingerprinter` field is used to pass custom fingerprinters into the Telescope Client. It should return a hash of identifiable visitor properties that Telescope users can then key off of when searching for visitors.

Fingerprinters currently have two properties:

* `script` (string): The URL (or local path) of the source code, if applicable. This script is loaded asynchronously and the `execute` method is called once it is finished loading.
* `execute` (function): A method that returns a hash of identifying fields about the visitor.

```javascript
const telescopeConfig = {
  fingerprinter: {
    script: false, // If there are no external scripts to load, this line can be omitted
    execute: () => ({
      user_agent: navigator.userAgent,
      device_type: getUserDeviceType(), // Example, not a real method
    }),
  },
};
```

**Note (web/app devs)**: `id` is a reserved field in the fingerprint. After the `execute` method has been called, it will be generated by running the concatenated and stringified fingerprint fields through the [MurmurHash3](https://en.wikipedia.org/wiki/MurmurHash#MurmurHash3) algorithm.

#### Events

See [Terminology](#terminology)

The events property is an array, in which one or more event bindings can be defined.

Each event definition contains three properties:

* `selectors` (string): CSS selectors to specify which elements to bind to.
* `name` (string): The browser event the client will listen for in order to fire the event.
* `tag` (string): The event tag type that tells Telescope how to process the event.

**Note (web devs)**: The only tags currently supported are `ClickEvent`, `FormEvent`, `PhoneEvent`, and `ChatEvent`. Custom event tags coming soon!

*Default events (if not present in `telescopeConfig`)*
```javascript
const telescopeConfig = {
  events: [{
    selectors: 'a, button',
    name: 'click',
    tag: 'ClickEvent',
  }],
};
```

**Note (web devs)**: The above example is the default Telescope click-tracking event, which does not have to be designated in the constructor. Passing your own events will override the default click tracker. Event selectors are parsed using `document.querySelectorAll`. On IE9+, this should support all CSS3 selectors and HTML5 elements but for IE8, this function is limited to CSS2.1 selectors and HTML4 elements.

### Attaching and detaching event listeners

To conditionally attach or detach Telescope event listeners, two methods have been exposed to the client. They provide similar functionality to the constructor-initialized events above but they allow site developers to manage access to these events and pass custom data through to Telescope.

*Example*:
```javascript
var ref;

if (canFireFormEvents) {
  ref = telescope.attach('.form-lock', 'click', 'FormEvent', { isTrue: true });
} else {
  telescope.detach(ref);
}
```

Calling the `attach` method returns a reference to the bound event callbacks. Subsequently passing that reference to the `detach` method will remove each of these callbacks.

**Note (web devs)**: The fourth parameter is optional and works the same way as `data` does in the `fire` method below. See the next section for usage.

### Firing events manually

To fire additional events in your logic without binding them to DOM listeners, determine the condition(s) under which they should trigger and any optional payload data you wish to send, then invoke the `fire` method:

*Example*:
```javascript
document.getElementById('target').addEventListener('click', function () {
  telescope.fire(tag, element, data);
});
```

This function takes 1, 2, or 3 parameters:

* `tag` (string): This is the only required parameter. See [Events](#events)
* `element` (HTMLElement) or `data` (object): If an HTMLElement (or jQuery element) is passed here, its text and attributes will be parsed automatically by the client; otherwise, a hash of payload fields may be passed here.
* `data` (object): If the previous value is an HTMLElement, you may pass a hash of payload fields here; otherwise, it will be ignored.

**Note**: Any `data` hashes will be run through `JSON.stringify` before they are sent to Telescope. As such, they should always [validate](http://jsonlint.com/) as json.

### Building and deploying

To build the Telescope client locally:

1. Download this directory from Github (or clone the entire Telescope project).
2. `yarn` to set up dev dependencies.
3. `yarn build` to compile all of the files in the `/src` directory into the minified `dist/client.min.js` and `dist/client.min.js.gz` files.

To deploy the Telescope client:

1. Ensure that the `package.json` file in this directory is versioned appropriately according to semver.
2. `node deploy` to enter the [vorpal](https://github.com/dthree/vorpal) shell.
3. `deploy -s [stage]` to run the deployment script.

To browser test:

1. Make sure the Telescope API (or some other event-consuming API) is running locally on your machine and get its URL.
2. [Initialize the Telescope client](#initializing-the-telescope-client), passing the appropriate parameters for testing.
