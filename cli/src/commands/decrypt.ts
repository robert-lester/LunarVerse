#!/usr/bin/env ts-node
import * as Ora from 'ora';
import * as print from '../util/print';
import * as parseArgs from 'minimist';
import * as fs from 'fs';
import * as path from 'path';
import { decrypt } from '../util/decrypt';

const argv = parseArgs(process.argv.slice(2));
const stages = argv._;

// This command requires a list of stages
if (stages.length === 0) {
  print.err('Please provide a list of stages to be decrypted.');
  process.exit(1);
}

// Commands are executed relative to the "buildpath"
let buildpath = '../';

if (argv.buildpath && argv.buildpath !== '') {
  buildpath = argv.buildpath;
}

buildpath = path.resolve('.', buildpath);

if (! fs.existsSync(buildpath)) {
  print.err(`The buildpath \"${buildpath}\" is invalid!`);
  process.exit(1);
}

// Start an activity indicator
// For each stage, attempt to decrypt the configuration file
const stagesPromises = stages.map(async (stage: string) => {
  return decrypt(stage, buildpath);
});

// Start an activity indicator
// Wait for all the promises to resolve
// When it's all over, stop the spinner and produce an exit status code
(async () => {
  const spinner = new Ora().start();

  await Promise.all(stagesPromises)
    .then(() => {
      spinner.stop();
      process.exit(0);
    })
    .catch((error) => {
      spinner.stop();
      print.err(error.message);
      process.exit(1);
    });
})();
