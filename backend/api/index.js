import { Router } from 'express';
import agentRoutes from './agent.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import diagnosesRoutes from './diagnoses.routes.js';
import { userExtractor } from '../middleware/auth.middleware.js'; // 1. IMPORT

const router = Router();

// --- Public Routes ---
// Anyone can log in or register
router.use('/login', authRoutes);
router.use('/users', userRoutes);

// --- Protected Routes ---
// Only logged-in users can access these
router.use('/agent', userExtractor, agentRoutes);
router.use('/diagnoses', userExtractor, diagnosesRoutes);

export default router;