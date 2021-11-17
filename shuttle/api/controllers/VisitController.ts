import Controller from './controller';
import HTTPException from '../../exceptions/HTTPException';
import { Visitor, Event } from '../models';

class VisitController extends Controller {
  /**
   * Builds visits based on the visit_uid
   * @param uid string of visit_uid
   * @returns a formatted version of visits
   */
  public async read(uid: string): Promise<object> {
    this.connect();

    const visits: any = await Event.query(this.connection)
      .where({ visit_uid: uid })
      .orderBy('created_at', 'desc')
      .eager('visitor');

    if (!visits.length) {
      throw new HTTPException('Event not found', 404);
    }
    return this.formatVisitResponse(visits);
  }

  public async buildVisitData(data) {
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
  }

  /**
   * Formats visits for the UI
   * @param events array of visits
   * @returns a new object with the events data
   */
  private async formatVisitResponse(events) {
    const clickPath = [];
    const firstEvent = events[events.length - 1];
    const parseData = JSON.parse(firstEvent.data);

    events.forEach((event) => {
      const str = Event.buildEventComplexPath(event);

      clickPath.push(str);
    });

    return {
      visitor_uid: firstEvent.visitor_uid,
      visit_uid: firstEvent.visit_uid,
      site_uid: firstEvent.site_uid,
      type_id: firstEvent.type_id >= 4 ? firstEvent.type_id : 1,
      data: {
        referrer: parseData.referrer,
        get_vars: parseData.get_vars || {},
      },
      fingerprint: await Visitor.buildAgent(firstEvent.visitor.fingerprint),
      ip_address: parseData.ip_address,
      click_path: clickPath,
      formatted_path: `[${clickPath.join(']-[')}]`,
      first_event: firstEvent.created_at,
      last_event: events[0].created_at,
      raw_visit_data: await this.formatRawVisit(events),
    };
  }

  /**
   * removes visitor and reverses the list of events
   * @param events array of events inside visitor
   * @returns formatted events
   */
  private async formatRawVisit(events) {
    events.forEach((event) => {
      delete event.visitor;
    });

    return events.reverse();
  }
}

export default VisitController;
