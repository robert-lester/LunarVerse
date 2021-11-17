import * as supertest from 'supertest';

/**
 * Utility to spin up supertest instances and run requests against them easily
 * @param port Port to attach the tester to
 */
export const createLocalServerRequestInstance = (port: number) => {
  const request = supertest(`http://localhost:${port}`);

  return (query: string, orgId = 'data-accuracy-qa'): Promise<any> => new Promise((resolve, reject) => {
    request
      .post('/api')
      .send({
        query,
      })
      .set('organization_id', orgId)
      .expect(200)
      .end((err, res) => {
        if (err) {
          reject(err);
        }
        resolve(JSON.parse(res.text));
      });
  });
};