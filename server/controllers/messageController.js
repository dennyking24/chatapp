const CryptoJS = require("crypto-js"); // Import the crypto-js module
const Messages = require("../models/messageModel");

const secretKey = "your_secret_key"; // Make sure to keep this key safe

// Encrypt message before saving it
const encryptMessage = (message) => {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
};

// Decrypt message before sending to the client
const decryptMessage = (encryptedMessage) => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8); // Returns the decrypted message
};

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    // Decrypt the messages before sending them to the client
    const decryptedMessages = messages.map((msg) => ({
      fromSelf: msg.sender.toString() === from,
      message: decryptMessage(msg.message.text),
    }));

    res.json(decryptedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;

    // Encrypt the message before saving to the database
    const encryptedMessage = encryptMessage(message);

    const data = await Messages.create({
      message: { text: encryptedMessage },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};

