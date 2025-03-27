const forge = require('node-forge');
const CryptoJS = require('crypto-js');

// Generate RSA key pair (public/private)
const generateRsaKeyPair = () => {
  const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair(2048);
  return {
    publicKeyPem: forge.pki.publicKeyToPem(publicKey),
    privateKeyPem: forge.pki.privateKeyToPem(privateKey),
  };
};

// RSA Encryption: Encrypt AES key with RSA public key
const encryptAesKeyWithRsa = (aesKey, publicKeyPem) => {
  const rsaPublicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  return rsaPublicKey.encrypt(aesKey);
};

// RSA Decryption: Decrypt AES key with RSA private key
const decryptAesKeyWithRsa = (encryptedAesKey, privateKeyPem) => {
  const rsaPrivateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  return rsaPrivateKey.decrypt(encryptedAesKey);
};

// AES Encryption: Encrypt message using AES
const encryptMessageWithAes = (message, aesKey) => {
  const iv = CryptoJS.lib.WordArray.random(16); // Initialization Vector
  const encrypted = CryptoJS.AES.encrypt(message, aesKey, { iv }).toString();
  return { encryptedMessage: encrypted, iv: iv.toString() };
};

// AES Decryption: Decrypt message using AES
const decryptMessageWithAes = (encryptedMessage, aesKey, iv) => {
  const decrypted = CryptoJS.AES.decrypt(encryptedMessage, aesKey, { iv: CryptoJS.enc.Base64.parse(iv) });
  return decrypted.toString(CryptoJS.enc.Utf8);
};

module.exports = { generateRsaKeyPair, encryptAesKeyWithRsa, decryptAesKeyWithRsa, encryptMessageWithAes, decryptMessageWithAes };

     
