import jwt from 'jsonwebtoken';

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

      // --- ❗️ THIS IS THE FIX ---
      // next() must be called *inside* the 'try' block
      // to continue to the next route.
      next(); 
      
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ error: 'Token expired or invalid' });
    }
  } else {
    // If no token, just return an error. Do not call next().
    return res.status(401).json({ error: 'Token missing' });
  }

  // --- BUG ---
  // The 'next()' call was here, which was wrong.
};