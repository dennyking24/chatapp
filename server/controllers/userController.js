const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const forge = require('node-forge');
const jwt = require('jsonwebtoken');

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ msg: "This username doesn't exist.", status: false });
    }

    // Compare the entered password with the hashed password in the database
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res.json({ msg: "The password is incorrect.", status: false });
    }

    // If the password is correct, remove the password from the user object
    delete user.password;

    // Generate JWT token signed with the private RSA key
    const token = generateJwtToken(user.rsaPrivateKey, user._id);

    // Return the response with the status and the generated token
    return res.json({ status: true, user, token });
  } catch (err) {
    next(err);
  }
};

// Function to generate JWT token
const generateJwtToken = (privateKeyPem, userId) => {
  // Create the payload with user ID and any additional claims
  const payload = {
    userId,
    // You can add more claims as needed
  };

  // Options for the JWT token including expiration and algorithm
  const signOptions = {
    expiresIn: '1h',  // Token expiration (adjust as necessary)
    algorithm: 'RS256',  // Use RSA algorithm with SHA-256
  };

  // Sign the JWT token using the private key
  const token = jwt.sign(payload, privateKeyPem, signOptions);

  return token;
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if the username is already taken
    const userNameCheck = await User.findOne({ username });
    if (userNameCheck) {
      return res.json({ msg: "Username already used", status: false });
    }

    // Check if the email is already taken
    const userEmailCheck = await User.findOne({ email });
    if (userEmailCheck) {
      return res.json({ msg: "Email already used", status: false });
    }

    // Generate RSA key pair
    const { publicKeyPem, privateKeyPem } = generateRsaKeyPair();

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      rsaPublicKey: publicKeyPem,
      rsaPrivateKey: privateKeyPem,
    });

    // Remove the password field from the response for security reasons
    delete user.password;

    return res.json({ status: true, user });
  } catch (err) {
    next(err);
  }
};

// Function to generate RSA key pair
const generateRsaKeyPair = () => {
  const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair(2048);
  return {
    publicKeyPem: forge.pki.publicKeyToPem(publicKey),
    privateKeyPem: forge.pki.privateKeyToPem(privateKey),
  };
};


module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);

    return res.json(users);
  } catch (err) {
    next(err);
  }
};

module.exports.logOut = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.json({ msg: "User id is required." });
    }

    return res.status(200).send();
  } catch (err) {
    next(err);
  }
};
