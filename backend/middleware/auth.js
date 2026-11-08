const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'fallback_dev_secret_galo_travel';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

module.exports = auth;
