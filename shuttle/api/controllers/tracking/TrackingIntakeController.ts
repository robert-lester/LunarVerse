import Controller from '../controller';
import { Event, Site, Visitor } from '../../models';

class TrackingIntakeController extends Controller {
  /**
   * Checks if the site exists in the DB based on current_url
   * @param data object containing current_url
   * @returns true if site exists or false if not
   */
  public async verifySite(data) {
    this.connect();

    const domain = Site.parseDomain(data.current_url);

    const sites = await Site.query(this.connection)
      .where({ domain });

    return sites.length ? true : false;
  }

  /**
   * Creates an event in the DB
   * @param attributes all data inside the body request
   * @returns an object of the newly inserted event
   */
  public async createEvent(attributes) {

    const EVENT_TYPE_MAP = {
      LoadEvent: 1,
      ClickEvent: 3,
      FormEvent: 4,
      PhoneEvent: 5,
      ChatEvent: 6,
    };

    if (attributes.event_tag === 'UnloadEvent') {
      return {
        uid: attributes.uid,
      };
    }

    const insert = {
      created_at: new Date().toISOString(),
      data: JSON.stringify(attributes.data),
      event_uid: attributes.load_uid || attributes.state.split('::')[2],
      site_uid: attributes.site_uid,
      type_id: EVENT_TYPE_MAP[attributes.event_tag],
      uid: attributes.uid,
      visit_uid: attributes.visit_uid || attributes.state.split('::')[1],
      visitor_uid: attributes.visitor_uid || attributes.state.split('::')[0],
    };

    return Event.query(this.connection).insert(insert);
  }

  /**
   * Inserts or updates visitor DB based on id
   * @param attributes all data inside the body request
   * @returns an object of inserted or updated visitor
   */
  public async upsertVisitor(attributes) {
    this.connect();

    const upsert = await Visitor.query(this.connection)
      .upsertGraph({
        created_at: new Date().toISOString(),
        data: JSON.stringify(attributes.data),
        fingerprint: JSON.stringify({
          ip_address: attributes.sourceIp,
          user_agent: attributes.userAgent,
        }),
        site_uid: attributes.site_uid,
        id: attributes.visitor_uid || attributes.state.split('::')[0],
        updated_at: new Date().toISOString(),
        }, { insertMissing: true } );

    return upsert;
  }
}

export default TrackingIntakeController;
