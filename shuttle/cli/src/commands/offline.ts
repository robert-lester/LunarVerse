import * as fs from 'fs';
import * as Ora from 'ora';
import * as exec from '../util/exec';

const createFrontendEnv = () => {
  const env = `REACT_APP_SASS=true\nREACT_APP_LESS=false\nREACT_APP_STYLUS=false\nREACT_APP_CSS_MODULES=false\nREACT_APP_DECORATORS=true`;
  fs.writeFileSync(`${process.cwd()}/shuttle-ui/.env`, env);
}

const createFrontendConfig = (stage) => {
  const config = `export const API_URL = 'http://localhost:8000';\nexport const STAGE = '${stage}';`;
  fs.writeFileSync(`${process.cwd()}/shuttle-ui/src/config.js`, config);
}

const startBackend = async (stage) => {
  await exec.promise(`sls offline --stage=${stage} --port=8000`, true);
};

const startFrontend = async (stage) => {
  createFrontendEnv();
  createFrontendConfig(stage);
  await exec.promise(`cd shuttle-ui && yarn start`, true);
};

const start = (stage) => {
  const promises = [];
  promises.push(startBackend(stage));
  promises.push(startFrontend(stage));
  return Promise.all(promises);
};

start('staging');