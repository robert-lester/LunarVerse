import * as fs from 'fs';
import * as AWS from 'aws-sdk';
import * as zlib from 'zlib';

const kms = new AWS.KMS({ region: 'us-east-1' });

export async function encrypt(file: string): Promise<AWS.KMS.EncryptResponse> {
  // Note: The environment files got too big to encrypt in a plaintext format
  // TODO: Find a more permanent encryption solution than GZip
  const contents = zlib.gzipSync(fs.readFileSync(file));
  const params: AWS.KMS.EncryptRequest = {
    KeyId: 'alias/lunar/cli/environment',
    Plaintext: contents,
  };
  const encrypted: AWS.KMS.EncryptResponse = await kms.encrypt(params).promise();
  return encrypted;
}

export async function decrypt(file: string): Promise<AWS.KMS.DecryptResponse> {
  const contents = fs.readFileSync(file);
  const params: AWS.KMS.DecryptRequest = {
    CiphertextBlob: contents,
  };
  const decrypted: AWS.KMS.DecryptResponse = await kms.decrypt(params).promise();

  decrypted.Plaintext = zlib.gunzipSync(decrypted.Plaintext as Buffer);

  return decrypted;
}
