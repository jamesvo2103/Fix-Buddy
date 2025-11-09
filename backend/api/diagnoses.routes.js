// backend/api/diagnoses.routes.js
import { Router } from 'express';
import { Diagnosis } from '../models/Diagnosis.js';

const router = Router();

// GET /api/diagnoses - Get all diagnoses for the logged-in user
router.get('/', async (req, res) => {
  try {
    // req.user.id should be available from your auth middleware
    const diagnoses = await Diagnosis.find({ userId: req.user.id })
      .sort({ createdAt: -1 }) // Sort newest first
      .limit(10); // Limit to 10
    
    res.json({ diagnoses });
  } catch (error) {
    console.error('GET /diagnoses error:', error);
    res.status(500).json({ error: 'Failed to fetch diagnoses' });
  }
});

// GET /api/diagnoses/:id - Get a single diagnosis
router.get('/:id', async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findOne({
      _id: req.params.id,
      userId: req.user.id // Ensure user can only get their own
    });

    if (!diagnosis) {
      return res.status(404).json({ error: 'Diagnosis not found' });
    }
    
    res.json({ diagnosis });
  } catch (error) {
    console.error('GET /diagnoses/:id error:', error);
    res.status(500).json({ error: 'Failed to fetch diagnosis' });
  }
});

// DELETE /api/diagnoses/:id - Delete a single diagnosis
router.delete('/:id', async (req, res) => {
  try {
    const result = await Diagnosis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id // Ensure user can only delete their own
    });

    if (!result) {
      return res.status(404).json({ error: 'Diagnosis not found' });
    }
    
    res.status(200).json({ message: 'Diagnosis deleted' });
  } catch (error) {
    console.error('DELETE /diagnoses/:id error:', error);
    res.status(500).json({ error: 'Failed to delete diagnosis' });
  }
});

export default router;