import { expect } from 'chai';
import 'mocha';
import MediaUtil from '../../../src/lib/media';

describe('lib/media', () => {
  const mediaDetails = {
    NumMedia: 1,
    MediaUrl0: 'http://www.belunar.com',
    MediaContentType0: 'image/jpeg',
  };

  describe('BuildMediaObjects', () => {
    const mediaUtil: MediaUtil = new MediaUtil();

    it('creates a formatted array of media objects', async () => {
      const mediaObjectArray = await mediaUtil.buildMediaObjects(mediaDetails as any);

      expect(mediaObjectArray).to.be.an('array');
      expect(mediaObjectArray[0]).to.have.property('url');
      expect(mediaObjectArray[0]).to.have.property('mime_type');
    });
    it('throws an error if no Media Urls exist', async () => {
      try {
        await mediaUtil.buildMediaObjects({ NumMedia: 1 } as any);
      } catch (err) {
        expect(err.message).to.equal('Media Url does not exist');
      }
    });
    it('throws an error if Media Url is not a valid url', async () => {
      const mediaObject = {
        NumMedia: 2,
        MediaUrl0: 'http://belunar.com',
        MediaContentType0: 'image/jpeg',
        MediaUrl1: 'www.imageUrl.com',
        MediaContentType1: 'image/jpeg',
      };

      try {
        await mediaUtil.buildMediaObjects(mediaObject as any);
      } catch (err) {
        expect(err.message).to.include('Invalid URL');
      }
    });
    it('throws an error if no Media Content Types exist', async () => {
      try {
        await mediaUtil.buildMediaObjects({
          NumMedia: 1,
          MediaUrl0: 'https://www.belunar.com',
        } as any);
      } catch (err) {
        expect(err.message).to.equal('Media Content Type does not exist');
      }
    });
  });
});
