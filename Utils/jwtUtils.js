const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  const secretKey = process.env.JWT_SECRET_KEY; // Replace with your own secret key
  const options = {
    expiresIn: '3d', // Token expiration time
    algorithm: 'HS256', // Use a compact algorithm
  };

  const token = jwt.sign(payload, secretKey, options);
  return token;
};

module.exports = generateToken;
