import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const userExtractor = async (req, res, next) => {
  const authorization = req.get('authorization');

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const token = authorization.substring(7);
      const decodedToken = jwt.verify(token, process.env.SECRET);

      if (!decodedToken.id) {
        return res.status(401).json({ error: 'Token invalid' });
      }

      // Attach the user's id to the request
      req.user = { id: decodedToken.id, username: decodedToken.username };
      
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ error: 'Token expired or invalid' });
    }
  } else {
    return res.status(401).json({ error: 'Token missing' });
  }

  next();
};