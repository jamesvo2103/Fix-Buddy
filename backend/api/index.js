// backend/api/index.js
import { Router } from 'express';
import agentRoutes from './agent.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import diagnosesRoutes from './diagnoses.routes.js'; // 1. IMPORT

const router = Router();

router.use('/agent', agentRoutes);
router.use('/login', authRoutes);
router.use('/users', userRoutes);
router.use('/diagnoses', diagnosesRoutes); // 2. ADD THIS LINE

export default router;