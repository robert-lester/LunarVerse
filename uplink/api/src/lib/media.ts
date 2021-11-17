import * as urlUtil from 'url';
import * as path from 'path';
import { MediaObject, ITwilioMessageRequest } from '../@types';

/**
 *  Handle all media messages functions
 * @alias module:MediaUtil
 */
class MediaUtil {
  /**
   * Loops through the request body to build an array of media objects.
   * @param body Request body
   * @return Promise containing array of urls
   */
  public async buildMediaObjects(body: ITwilioMessageRequest): Promise<MediaObject[]> {
    const mediaUrls: MediaObject[] = [];

    for (let i = 0; i < body.NumMedia; i++) {
      if (!(body[`MediaUrl${i}`])) {
        throw new ReferenceError('Media Url does not exist');
      }

      new urlUtil.URL(body[`MediaUrl${i}`]);

      if (!(body[`MediaContentType${i}`])) {
        throw new ReferenceError('Media Content Type does not exist');
      }

      const mediaUrl: string = body[`MediaUrl${i}`];
      const contentType: string = body[`MediaContentType${i}`];
      const mediaSid: string = path.basename(urlUtil.parse(mediaUrl).pathname);

      mediaUrls.push({
        url: mediaUrl,
        mime_type: contentType,
        external_id: mediaSid,
      });
    }

    return mediaUrls;
  }
}

export default MediaUtil;
