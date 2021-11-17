// TODO: Turn this into TS and add to serverless config
export const handler = (event, context, callback) => {
  // Get contents of response
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  // Set new headers 
  headers['x-content-type-options'] = [{key: 'X-Content-Type-Options', value: 'nosniff'}]; 
  headers['x-frame-options'] = [{key: 'X-Frame-Options', value: 'SAMEORIGIN'}]; 
  headers['x-xss-protection'] = [{key: 'X-XSS-Protection', value: '1; mode=block'}];
  headers['cache-control'] = [{key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate'}]; 
  headers['pragma'] = [{key: 'Pragma', value: 'no-cache'}];

  // Return modified response
  callback(null, response);
};