import * as fs from 'fs';
import * as Cipher from './cipher';
import * as path from 'path';
import * as print from './print';

import * as AWS from 'aws-sdk';

const kms = new AWS.KMS({ region: 'us-east-1' });

export const decrypt = async (stage, filepath = '.'): Promise<void> => {
  const file: string = path.resolve(filepath, `./config/${stage}/env.encrypted`);
  print.info(`Decrypting stage ${stage} to ${file.replace('.encrypted', '.yml')}...`);
  const decrypted = await Cipher.decrypt(file);
  fs.writeFileSync(file.replace('.encrypted', '.yml'), decrypted.Plaintext.toString());
};
