import * as fs from 'fs';
import * as Ora from 'ora';

import * as print from '../util/print';
import * as Cipher from '../util/cipher';

const encrypt = async (stage): Promise<void> => {
  const file: string = `../config/${stage}/env.yml`;
  const encrypted = await Cipher.encrypt(file);
  fs.writeFileSync(file.replace('.yml', '.encrypted'), encrypted.CiphertextBlob);
};

const encryptAll = async (): Promise<void> => {
  const stages: string[] = ['demo', 'production', 'qa', 'staging', 'uplink-prod', 'integration', 'test'];
  for (let x = 0; x < stages.length; x++) {
    const stage: string = stages[x];
    const spinner = new Ora(`Encrypting ${stage}...`).start();
    await encrypt(stage);
    spinner.stop();
    print.succeed(`Finished encrypting ${stage} env!`);
  }
};

encryptAll();
