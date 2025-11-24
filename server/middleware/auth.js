import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  console.log('Auth header:', authHeader);
  console.log('Token received:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

  if (!token) {
    console.error('No token provided in Authorization header');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    console.error('Full token:', token);
    res.status(401).json({ error: 'Invalid token', details: err.message });
  }
};
