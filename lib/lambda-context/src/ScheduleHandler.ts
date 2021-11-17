import { ScheduledEvent } from 'aws-lambda';
import Handler from './Handler';

export class ScheduleHandler extends Handler<ScheduledEvent, void> {
  protected respond(body: any): void {
    console.info('Response body:\n', body);
  }
}