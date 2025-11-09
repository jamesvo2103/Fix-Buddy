import bcrypt from 'bcrypt';
import { Router } from 'express';
import { User } from '../models/User.js';

const usersRouter = Router();

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}, { username: 1, experience: 1 });
  response.json(users);
});

usersRouter.post('/', async (request, response) => {
  const { username, password, experience } = request.body;

  if (!experience || !['beginner', 'intermediate', 'expert'].includes(experience)) {
    return response.status(400).json({
      error: 'Experience must be one of: beginner, intermediate, expert'
    });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    password: hashedPassword,
    experience
  });

  const savedUser = await user.save();
  response.status(201).json({
    id: savedUser._id,
    username: savedUser.username,
    experience: savedUser.experience
  });
});

export default usersRouter;