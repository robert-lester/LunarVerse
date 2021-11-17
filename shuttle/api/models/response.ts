import { Model } from 'objection';

export class Response extends Model {
  public static tableName: string = 'responses';
  public static idColumn: string = 'id';

  public id: number;
  public pod_id: number;
  public destination_id: number;
  public status_code: number;
  public created_at: Date|string;
  public updated_at: Date|string;
  public message?: any;

  public parseJson() {
    try {
      this.message = JSON.parse(this.message);
    } catch (e) {
      this.message = {};
    }
    if (this.message === null) {
      this.message = {};
    }
  }

  public static format(response) {
    const raw = typeof response.raw_message === 'string'
      ? JSON.parse(response.raw_message) : response.raw_message;

    try {
      raw.response = JSON.parse(raw.response);
    } catch {}
    response.raw_message = raw;

    return response;
  }
}
