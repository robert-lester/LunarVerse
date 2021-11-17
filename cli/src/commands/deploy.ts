import * as fs from 'fs';
import * as Ora from 'ora';

import * as print from '../util/print';
import * as exec from '../util/exec';
import * as Cipher from '../util/cipher';
import * as Yarn from '../util/yarn';

const decrypt = async (stage): Promise<void> => {
  const file: string = `./config/${stage}/env.encrypted`;
  const decrypted = await Cipher.decrypt(file);
  fs.writeFileSync(file.replace('.encrypted', '.yml'), decrypted.Plaintext.toString());
};

const decryptAll = async (): Promise<void> => {
  const stages: string[] = [ 'demo', 'production', 'qa', 'staging', 'uplink-prod' ];
  for(let x = 0; x < stages.length; x++) {
    const stage: string = stages[x];
    await decrypt(stage);
  }
};

const decryptEnvironmentVariables = async (): Promise<void> => {
  const spinner = new Ora(`Decrypting environment files...`).start();
  await decryptAll();
  spinner.stop();
  print.succeed('Finished decrypting environment files!');
};

const refreshNodeModules = async (): Promise<void> => {
  const spinner = new Ora('Installing external libraries...').start();
  await Yarn.install();
  spinner.stop();
  print.succeed('External libraries installed!')
};

const deployProjects = async (): Promise<void> => {
  const stage = 'staging';

  let spinner = new Ora('Deploying core...').start();
  await exec.promise(`cd ./core/ && sls deploy --stage=${stage}`);
  spinner.stop();
  print.succeed('Core deployed!');

  spinner = new Ora('Deploying telescope...').start();
  await exec.promise(`cd ../telescope/ && sls deploy --stage=${stage}`);
  spinner.stop();
  print.succeed('Telescope deployed!');

  spinner = new Ora('Deploying shuttle...').start();
  await exec.promise(`cd ../shuttle/ && sls deploy --stage=${stage}`);
  spinner.stop();
  print.succeed('Shuttle deployed!');
}

decryptEnvironmentVariables()
  .then(refreshNodeModules)
  .then(deployProjects);