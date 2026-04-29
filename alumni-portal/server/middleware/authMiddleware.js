const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return res.status(401).json({ message: 'Not authorized. Please login.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(401).json({ message: 'User no longer exists.' });
    if (!user.isActive) return res.status(401).json({ message: 'Account deactivated. Contact admin.' });
    if (!user.isEmailVerified) return res.status(401).json({ message: 'Please verify your email first.' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Session expired. Please login again.' });
    return res.status(401).json({ message: 'Invalid token. Please login again.' });
  }
};

module.exports = { protect };
