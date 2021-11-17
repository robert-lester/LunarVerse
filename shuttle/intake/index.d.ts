export type Primitive = undefined|null|boolean|number|string;
export interface PrimitiveArray {
  [key: number]: Primitive|PrimitiveArray|PrimitiveDictionary; 
}
export interface PrimitiveDictionary {
  [key: string]: Primitive|PrimitiveArray|PrimitiveDictionary;
}
export interface DestinationMapping {
  [key: string]: string[];
}
export interface Mapping {
  [key: string]: string;
}
export interface TelescopeIds {
  event_uid: string;
  id: string;
  visit_uid: string;
  visitor_uid: string;
}
export interface Metadata {
  created_at: string;
  created_date: string;
  id?: number;
  telescope: TelescopeIds;
  updated_at: string;
}
export interface SubmissionData extends PrimitiveDictionary {
  telescope_id?: string;
}

export interface TelescopeEvent {
  uid: string;
  visitor_uid: string;
  visit_uid: string;
  type_id: number;
  site_uid: string;
  data: TelescopeEventData|string;
  event_uid: string;
  created_at: string;
  updated_at: null;
  fingerprint: TelescopeEventFingerprint;
}

export interface TelescopeData {
  id: string;
  uid: string;
  vid: string;
  lid: string;
  referrer: string;
  user_agent: string;
  device: string;
  browser: string;
  browser_version: string;
  operating_system: string;
  ip_address: string;
  click_path: string;
  gclid: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  mkwid: string;
  get_vars: {
    [key: string]: string;
  };
  events: TelescopeEvent[];
}

export interface MappableData {
  pod: SubmissionData;
  shuttle: Metadata;
  telescope: TelescopeData;
}

export interface TelescopeEventData {
  referrer: string;
  current_url: string;
  ip_address: string;
  element: {
    html: string;
  };
  get_vars: {
    [key: string]: string;
  };
  user_agent?: string;
  user_agent_server?: string;
}

export interface TelescopeEventFingerprint {
  ip_address?: string;
  user_agent_server?: string;
  device?: string;
  browser?: string;
  browser_version?: string;
  os?: string;
  user_agent?: string;
}
