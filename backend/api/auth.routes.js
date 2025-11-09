import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Router } from 'express';
// --- FIXED IMPORT ---
import { User } from '../models/User.js';

const loginRouter = Router();

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body;
  const user = await User.findOne({ username });
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.password);

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: '1h' });

  response
    .status(200)
    .send({ token, username: user.username, experience: user.experience });
});

export default loginRouter;