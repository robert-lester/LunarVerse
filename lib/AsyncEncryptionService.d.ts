export default interface AsyncEncryptionService<Plaintext, Ciphertext> {
  encrypt(plaintext: Plaintext): Promise<Ciphertext>;
  decrypt(ciphertext: Ciphertext): Promise<Plaintext>;
}