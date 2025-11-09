import mongoose from 'mongoose';

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  experience: { type: String, enum: ['beginner', 'intermediate', 'expert'], default: 'beginner' },
  toolsOwned:{ type: [String], default: [] },
  
});

// Diagnosis History schema
const diagnosisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String, required: true },
  itemModel: String,
  repairabilityScore: Number,
  issues: [{
    problem: String,
  }],
  diagnosis: {
    safety: String,
    tools: [String],
    steps: [String],
    parts: [{
      name: String,
      estimatedCost: Number
    }]
  },
  nearbyShops: [{
    name: String,
    address: String,
    rating: Number,
    placeId: String
  }],
  tutorials: [{
    title: String,
    url: String,
    source: String
  }],
  createdAt: { type: Date, default: Date.now }
});

// Keep only last 10 diagnoses
diagnosisSchema.index({ userId: 1, createdAt: -1 });

export const User = mongoose.model('User', userSchema);
export const Diagnosis = mongoose.model('Diagnosis', diagnosisSchema);