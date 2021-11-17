import * as https from 'https';

export default class SlackNotification {
  /**
   * Actual logic to send message to slack
   * @param {string} message The text field for the slack message
   */
  public sendToSlack(message: string) {
    const options = {
      hostname: 'hooks.slack.com',
      path: process.env.SUCCESS_SLACK_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    // Create a https post request
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');

      res.on('data', (chunk) => {
        if (chunk !== 'ok') {
          throw new Error(chunk as string);
        }
      });
    });
    // Send message to Slack
    req.write(JSON.stringify({ text: message }));
    req.end();
  }
}