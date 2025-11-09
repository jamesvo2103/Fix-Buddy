
import { Router } from 'express';
import { Diagnosis } from '../models/Diagnosis.js';

const router = Router();

// GET /api/diagnoses 
router.get('/', async (req, res) => {
  try {

    const diagnoses = await Diagnosis.find({ userId: req.user.id })
      .sort({ createdAt: -1 }) // Sort newest first
      .limit(10); // Limit to 10
    
    res.json({ diagnoses });
  } catch (error) {
    console.error('GET /diagnoses error:', error);
    res.status(500).json({ error: 'Failed to fetch diagnoses' });
  }
});

// GET /api/diagnoses/:id 
router.get('/:id', async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findOne({
      _id: req.params.id,
      userId: req.user.id 
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

// DELETE /api/diagnoses/:id 
router.delete('/:id', async (req, res) => {
  try {
    const result = await Diagnosis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id 
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