import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware to check for instructor role
export const isInstructor = (req, res, next) => {
    if(req.user.role !== 'instructor') {
        return res.status(403).json({ msg: 'Access denied. Instructors only.' });
    }
    next();
};

export default auth;