# Rocket 🚀

> A software developer once said: _"How did we get here"_

Rocket is a library that allows you to easily take in JSON data and send it in various formats.  It is used by Shuttle to handle sending the data to all of the endpoints we support.

### Supported Functions
- JSON
- XML
- Form
- Email
- Slack (Webhook only)
- Salesforce (Launchforce)
- Shuttleforce (Planned)
- Telescope
- Zoho (In development)

## Examples

### JSON, XML, or Form
```
const http = new Rocket.HTTP(url);
const type = 'json'; // 'xml' or 'form' is also valid
const data = {};
http.send(type, data).then((response) => { // Send JSON POST request
  console.log(response);
});
```
`http.send()` defaults to `POST` but can also be any HTTP method by providing the constructor the method type;

```
new Rocket.HTTP(url, 'PATCH')
```

### Email
```
const config = {
  to,       // required
  from,     // required 
  replyTo,  // optional
  cc,       // optional
  bcc       // optional
};
const email = new Rocket.Email(config);
email.send(subject, body).then((err, data) => {
  if (err) {
    console.error(err);
  } else {
    console.log(data);
  }
});
```

### Slack Webhook
```
const slack = new Rocket.Slack(webhook);
slack.send(message).then((response) => {
  console.log(response);
});
```

### Salesforce (Launchforce)
```
const salesforce = new Rocket.LegacySalesforce();
salesforce.send(url, data).then((response) => {
  console.log(response);
});
```

If you want more granular control, using the HTTP module to send JSON to launchforce is the better version for now.

### Shuttleforce (Planned)
```
// Planned
```

### Telescope
```
const telescope = new Rocket.Telescope();
telescope.send(data).then((response) => {
  console.log(response);
});
```

### Zoho (In development)
```
const zoho = new Rocket.Zoho(token, scope);
zoho.send(zohoObjectName, xmlData).then((response) => {
  console.log(response);
});
```