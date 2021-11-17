import axios from 'axios';
import { BaseRocket } from '../baseRocket';
import RocketResponse from './rocketResponse';

export class SlackRocket extends BaseRocket {
  constructor(type: string, config: any) {
    super(type, config);
    this.config.webhook = config.webhook ? config.webhook : config.url;

    if (!this.config.webhook) {
      throw new Error('Look what you made me do');
    }
  }

  /**
   * Sends slack message through axios and creates response
   * @param {object} data contains the message, channel, and username of the slack data
   * @returns {RocketResponse} built out response returned from axios
   */
  async send(data: any) :Promise<RocketResponse> {
      const r = await axios({
        url: this.config.webhook,
        method: 'POST',
        data: {
          text: data.message,
          channel: data.channel,
          username: data.username,
          icon_url: 'https://s3.amazonaws.com/belunar/static/media/shuttle_slack_icon.png',
        },
        validateStatus: () => true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      this.config.response = {
        status: r.status,
        raw: {
          status: r.status,
          statusText: r.statusText,
          response: r.data.toString(),
          message: 'Message sent successfully',
        },
      };

    return this.config.response;
  }
}