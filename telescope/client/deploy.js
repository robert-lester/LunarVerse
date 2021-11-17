/* eslint-disable import/no-extraneous-dependencies,no-console,security/detect-child-process */
const { S3 } = require('aws-sdk');
const { exec } = require('child_process');
const { readFile } = require('fs');
const packageJson = require('./package.json');
const vorpal = require('vorpal')();

const STAGES = ['demo', 'production', 'qa', 'staging'];

const s3 = new S3({ region: 'us-east-1' });

const parseVersionString = version => version.split('.').map(part => parseInt(part, 10));

vorpal.command('deploy [stage]')
  .autocomplete(STAGES)
  .option('-s, --stage <stage>')
  .action((args, callback) => {
    if (!STAGES.includes(args.options.stage)) {
      console.error(`Invalid stage "${args.options.stage}"`);
      callback();
    } else if (args.options.stage !== 'production') {
      console.error(`Deploying to stage "${args.options.stage}" is not yet implemented`);
      callback();
    } else {
      console.info('[1/4] Building client script...');
      exec('yarn build', (err) => {
        if (err) {
          console.error(err.stack);
          callback();
        } else {
          console.info('[2/4] Verifying build...');

          readFile('dist/client.min.js', async (err2, data) => {
            if (err2) {
              console.error(err2.stack);
              callback();
            }
            const fileBuffer = Buffer.from(data, 'binary');

            console.info('[3/4] Checking for uploaded version...');
            const object = await s3.getObject({
              Bucket: 'cdn.belunar.com',
              Key: 'telescope/client.min.js',
            }).promise();

            if (object.Metadata.version === undefined) {
              console.error('Could not find version string for uploaded resource');
              callback();
            } else {
              const currentVersion = parseVersionString(packageJson.version);
              const uploadedVersion = parseVersionString(object.Metadata.version);

              if (
                currentVersion[0] < uploadedVersion[0] ||
                (
                  currentVersion[0] === uploadedVersion[0] &&
                  currentVersion[1] < uploadedVersion[1]
                ) ||
                (
                  currentVersion[0] === uploadedVersion[0] &&
                  currentVersion[1] === uploadedVersion[1] &&
                  currentVersion[2] <= uploadedVersion[2]
                )
              ) {
                console.error(`Cannot deploy invalid script version: Expected >${object.Metadata.version}, got ${packageJson.version}`);
                callback();
              } else {
                console.info(`[4/4] Deploying version ${packageJson.version}...`);
                await Promise.all([
                  s3.putObject({
                    ACL: 'public-read',
                    Body: fileBuffer,
                    Bucket: 'cdn.belunar.com',
                    Key: 'telescope/client.min.js',
                    Metadata: {
                      version: packageJson.version,
                    },
                  }).promise(),
                  s3.putObject({
                    ACL: 'public-read',
                    Body: fileBuffer,
                    Bucket: 'cdn.belunar.com',
                    Key: `telescope/client-${currentVersion[0]}.${currentVersion[1]}.min.js`,
                    Metadata: {
                      version: packageJson.version,
                    },
                  }).promise(),
                ]);
                console.info('Done!');
                callback();
              }
            }
          });
        }
      });
    }
  });

vorpal.delimiter('telescope-client').show();
