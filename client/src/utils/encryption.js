import forge from 'node-forge';
import CryptoJS from 'crypto-js';

// Generate AES key (symmetric)
const generateAesKey = () => {
  return CryptoJS.lib.WordArray.random(32).toString(); // 256-bit AES key
};

// RSA Encryption: Encrypt AES key with RSA public key
const encryptAesKeyWithRsa = (aesKey, publicKeyPem) => {
  const rsaPublicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  return rsaPublicKey.encrypt(aesKey);
};

// AES Encryption: Encrypt message with AES key
const encryptMessageWithAes = (message, aesKey) => {
  const iv = CryptoJS.lib.WordArray.random(16); // Initialization Vector
  const encrypted = CryptoJS.AES.encrypt(message, aesKey, { iv }).toString();
  return { encryptedMessage: encrypted, iv: iv.toString() };
};

// AES Decryption: Decrypt message using AES key
const decryptMessageWithAes = (encryptedMessage, aesKey, iv) => {
  const decrypted = CryptoJS.AES.decrypt(encryptedMessage, aesKey, { iv: CryptoJS.enc.Base64.parse(iv) });
  return decrypted.toString(CryptoJS.enc.Utf8);
};

export { generateAesKey, encryptAesKeyWithRsa, encryptMessageWithAes, decryptMessageWithAes };
