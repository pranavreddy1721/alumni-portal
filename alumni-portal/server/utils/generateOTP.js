const crypto = require('crypto');

const generateOTP = () => {
  const buffer = crypto.randomBytes(3);
  const num = buffer.readUIntBE(0, 3);
  return String(100000 + (num % 900000));
};

module.exports = generateOTP;
