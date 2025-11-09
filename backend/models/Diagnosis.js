import mongoose from 'mongoose';

const diagnosisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String, required: true },
  itemModel: String,
  repairabilityScore: Number,
  repairabilityConfidence: String, 
  issues: [{
    problem: String,
    probability: Number, 
  }],
  diagnosis: {
    safety: String,
    tools: [String],
    steps: [String],
    parts: [{
      name: String,
      estimatedCost: Number
    }],
    timeEstimate: Number, 
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

export const Diagnosis = mongoose.model('Diagnosis', diagnosisSchema);