module.exports = {
  buildEventComplexPath: (event) => {
    switch (event.type_id) {
      case 1: // Load
        return event.data.current_url.replace(/http.?:\/\/www\..+?\.(com|org|net)/, '');
      case 2: // Unload
        return event.data.current_url.replace(/http.?:\/\/www\..+?\.(com|org|net)/, 'Unload - ');
      case 3:
        return `Click (<${event.data.element.html.replace(/"/g, "'")}>) - ${event.data.current_url.replace(/http.?:\/\/www\..+\.(com|org)/, '')}`;
      case 4:
        return 'Form Fillout';
      case 5:
        return event.data.current_url.replace(/http.?:\/\/www\..+?\.(com|org|net)/, 'Phone Call');
      case 6:
        return event.data.current_url.replace(/http.?:\/\/www\..+?\.(com|org|net)/, 'Chat');
      default:
        // eslint-disable-next-line
        console.error(`Invalid event type ID "${event.type_id}"`);

        return '';
    }
  },
};
