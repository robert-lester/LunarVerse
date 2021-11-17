const axios = require('axios');

class Observatory {
  // TODO: Replace this URL with a new Telescope API on the Lunar AWS org
  constructor(apiUrl = 'http://api-staging.launchthat.com/telescope') {
    this.apiUrl = apiUrl;
  }

  getVisitsByVisitor(id) {
    return axios.get(`${this.apiUrl}/visitors/${id}/visits`);
  }
  getVisitById(id) {
    return axios.get(`${this.apiUrl}/visits/${id}`).then((data) => {
      try {
        data = data.data;
        data = JSON.parse(data);
      } catch (err) {}
      return {
        id: data.visitor_uid || '',
        uid: data.visitor_uid || '',
        vid: data.visit_uid || '',
        referrer: (data.data || {}).referrer || '',
        user_agent: (data.fingerprint || {}).user_agent || (data.fingerprint || {}).user_agent_server || '',
        device: (data.fingerprint || {}).device || '',
        browser: (data.fingerprint || {}).browser || '',
        browser_version: (data.fingerprint || {}).browser_version || '',
        operating_system: (data.fingerprint || {}).os || '',
        ip_address: (data.fingerprint || {}).ip_address || '',
        click_path: data.click_path,
        gclid: ((data.data || {}).get_vars || {}).gclid || '',
        utm_source: ((data.data || {}).get_vars || {}).utm_source || '',
        utm_medium: ((data.data || {}).get_vars || {}).utm_medium || '',
        utm_campaign: ((data.data || {}).get_vars || {}).utm_campaign || '',
        utm_content: ((data.data || {}).get_vars || {}).utm_content || '',
        utm_term: ((data.data || {}).get_vars || {}).utm_term || '',
        mkwid: ((data.data || {}).get_vars || {}).mkwid || '',
        get_vars: (data.data || {}).get_vars || [],
        events: data.raw_visit_data || [],
      };
    }).catch((e) => {
      console.error(e);
      return {};
    });
  }
}
module.exports = Observatory;
