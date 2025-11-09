import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  experience: { type: String, enum: ['beginner', 'intermediate', 'expert'], default: 'beginner' },
  toolsOwned: { type: [String], default: [] },
});

export const User = mongoose.model('User', userSchema);