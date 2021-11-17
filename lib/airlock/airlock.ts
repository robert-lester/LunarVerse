import * as Crypto from 'crypto';
import * as KMS from 'aws-sdk/clients/kms';

import AsyncEncryptionService from '../AsyncEncryptionService';

export default class Airlock implements AsyncEncryptionService<string, Buffer> {
  private kms: KMS;

  constructor(private key: string) {
    if (typeof key !== 'string') {
      throw new TypeError('key must be a string');
    }
    if (!key.startsWith('alias')) {
      throw new TypeError('key must start with alias');
    }
    this.kms = Airlock.createKMS();
  }

  private static createKMS(): KMS {
    return new KMS({
      apiVersion: '2014-11-01',
      region: 'us-east-1',
    });
  }

  /**
   * Create a new organization master key and alias
   * @param orgName The name of the organization
   * @returns An Airlock instance that can be used to encrypt/decrypt data for that org
   */
  public static async createOrgKey(orgName: string, stage: string): Promise<Airlock> {
    if (typeof orgName !== 'string') {
      throw new TypeError('orgName must be a string');
    } else if (typeof stage !== 'string') {
      throw new TypeError('stage must be a string');
    }
    const kms = Airlock.createKMS();
    const keyAliases = (await kms.listAliases().promise()).Aliases;
    const orgSlug = orgName.toLowerCase().replace(/[^-a-z0-9]/g, '-');

    for (const alias of keyAliases) {
      // If the organization already has a key, return a new Airlock instance for the existing key
      if (alias.AliasName === `shuttle/airlock/${stage}/${orgSlug}`) {
        return new Airlock(`alias/shuttle/airlock/${stage}/${orgSlug}`);
      }
    }
    const response = await kms.createKey({
      Tags: [
        {
          TagKey: 'CreatedBy',
          TagValue: 'Airlock',
        },
        {
          TagKey: 'Organization',
          TagValue: orgName,
        },
        {
          TagKey: 'Organization Slug',
          TagValue: orgSlug,
        },
      ],
    }).promise();
    kms.createAlias({
      AliasName: `alias/shuttle/airlock/${stage}/${orgSlug}`,
      TargetKeyId: response.KeyMetadata.KeyId,
    }).promise();

    return new Airlock(`alias/shuttle/airlock/${stage}/${orgSlug}`);
  }

  /**
   * Encrypt plaintext using the current key in KMS
   * @param plaintext
   * @returns A Buffer containing the encrypted text
   */
  public async encrypt(plaintext: string): Promise<Buffer> {
    if (typeof plaintext !== 'string') {
      throw new TypeError('plaintext must be a string');
    }
    const response = await this.kms.encrypt({
      KeyId: this.key,
      Plaintext: plaintext,
    }).promise();

    return response.CiphertextBlob as Buffer;
  }

  /**
   * Decrypt ciphertext using KMS
   * @param ciphertext
   * @returns A string containing the decrypted text
   */
  public async decrypt(ciphertext: Buffer): Promise<string> {
    return (await this.decryptToBuffer(ciphertext)).Plaintext.toString();
  }

  /**
   * Intermediate method to partially decrypt a KMS value so it can be consumed as a Buffer
   * @deprecated
   * @param ciphertext
   * @returns A KMS response
   */
  public async decryptToBuffer(ciphertext: Buffer): Promise<KMS.DecryptResponse> {
    if (!Buffer.isBuffer(ciphertext)) {
      throw new TypeError('ciphertext must be a buffer');
    }
    return this.kms.decrypt({
      CiphertextBlob: ciphertext,
    }).promise();
  }

  /**
   * Decrypt ciphertext using a specific key
   * @deprecated
   * @param ciphertext
   * @returns A Buffer containing the decrypted text
   */
  public static decryptWithKey(ciphertext: Buffer, key: Buffer): Buffer {
    if (!Buffer.isBuffer(ciphertext)) {
      throw new TypeError('ciphertext must be a buffer');
    } else if (!Buffer.isBuffer(key)) {
      throw new TypeError('key must be a buffer');
    }
    const decipher = Crypto.createDecipher('aes-256-cbc', key);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  }
}