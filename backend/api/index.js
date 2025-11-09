// backend/api/index.js
import { Router } from 'express';
import agentRoutes from './agent.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/agent', agentRoutes);
router.use('/login', authRoutes);
router.use('/users', userRoutes);

export default router;