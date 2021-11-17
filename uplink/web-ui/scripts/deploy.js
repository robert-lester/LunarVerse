'use strict';

const environments = ['staging', 'qa', 'prod', 'integration'];
const env = process.argv.slice('2')[0];

// Exit if no env arg
if (!environments.includes(env)) {
  console.log('Please specify an environment arg: ', environments);
  process.exit();
}

// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = env;
// Ensure environment variables are read.
require('../config/env');

// Get bucket
const bucket = process.env[`S3_BUCKET_${env.toUpperCase()}`];
if (!bucket) {
  console.log('AW SNAP! Unable to determine S3 bucket for env: ', env);
  process.exit();
}
console.log('Deploying to bucket:', bucket);
const exec = require('child_process').exec;

// Handles validation process
const handleValidation = (error, stdout, stderr) => {
  console.log(`${stdout}`);
  console.log(`${stderr}`);
  if (error) {
    console.log(`AW SNAP! AWS validation error: ${error}`);
  } else {
    console.log('Invalidation successfully started.');
  }
};

// Handles the sync process
const handleSync = (error, stdout, stderr) => {
  console.log(`${stdout}`);
  console.log(`${stderr}`);
  if (error) {
    console.log(`AW SNAP! S3 sync error: ${error}`);
  } else {
    console.log(`Your bundle has been deployed to ${bucket}.`);
    // Validations
    console.log('Starting invalidation...');
    const distributionId = process.env[`S3_CLOUDFRONTID_${env.toUpperCase()}`];
    if (!distributionId) {
      console.log('AW SNAP! Unable to determine distribution id for env: ', env);
      process.exit();
    }
    exec(`aws cloudfront create-invalidation --distribution-id ${distributionId} --paths '/*'`, handleValidation);
  }
};

// Do the thing with the thing
exec(`aws s3 sync --acl public-read --cache-control no-cache build/ s3://${bucket}`, handleSync);