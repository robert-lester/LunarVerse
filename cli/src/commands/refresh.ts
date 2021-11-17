#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as Ora from 'ora';
import * as parseArgs from 'minimist';
import * as path from 'path';
import * as shell from 'shelljs';
import * as print from '../util/print';
import * as events from 'events';

// https://stackoverflow.com/questions/9768444/possible-eventemitter-memory-leak-detected
// HACK ATTACK: Don't do exactly what I am about to do.
// TODO: Replace shell.js exec call with child_process spawn
events.EventEmitter.defaultMaxListeners = 0;

// Commands are executed relative to the "buildpath"
const argv = parseArgs(process.argv.slice(2));
let buildpath = '../';

if (argv.buildpath && argv.buildpath !== '') {
  buildpath = argv.buildpath;
}

buildpath = path.resolve('.', buildpath);

if (! fs.existsSync(buildpath)) {
  print.err(`The buildpath \"${buildpath}\" is invalid!`);
  process.exit(1);
}

// Find only the directories that contain a yarn.lock file and are not
// a sub-directory of node_modules. Do not include root buildpath.
const findExec = `find ${buildpath} -name node_modules -prune -o -name "yarn.lock" -print \| xargs -I{} -n1 sh -c 'dirname {} | grep -v "${buildpath}$"'`;

const findStdout = shell.exec(findExec, { silent: true }).stdout as string;

// find produces a list of directories delimited by carriage return/newline
const dependencyPaths = findStdout.split(/\r?\n/);

// For each directory, attempt to asynchronously install dependencies
const dependenciesPromises = dependencyPaths.map(async (dependencyPath: string) => {
  // Do not include the cli directory. Be sure the path exists.
  if (dependencyPath === '' || dependencyPath === `${buildpath}/cli` || ! shell.test('-e', dependencyPath)) {
    return Promise.resolve();
  }

  dependencyPath = `${dependencyPath}/node_modules`;

  return new Promise((resolve, reject) => {
    print.info(`Installing ${dependencyPath}...`);

    // The installation must be done synchronously. There is an issue with
    // yarn an parallel install and yarn cache locking.
    const result = shell.exec(`yarn --cwd ${dependencyPath} install --prefer-offline --frozen-lockfile --non-interactive --cache-folder ~/.cache/yarn`, { silent: false });

    if (result.stderr !== '') {
      print.error(`Failed to install ${dependencyPath} because \"${result.stderr}\"`);
      reject();
    } else {
      print.info(`Successfully installed ${dependencyPath}!`);
      resolve();
    }
  });
});

// Start an activity indicator
// Wait for all the promises to resolve
// When it's all over, stop the spinner and produce an exit status code
(async () => {
  const spinner = new Ora().start();

  await Promise.all(dependenciesPromises)
    .then(() => {
      spinner.stop();
      process.exit(0);
    })
    .catch((error) => {
      spinner.stop();
      print.err(error && error.message ? error.message : 'An error occurred while resolving dependencies. [ LunarVerse/cli/src/commands/refresh.ts ]');
      process.exit(1);
    });
})();
