// backend/api/agent.routes.js
import { Router } from 'express';
import rateLimit from 'express-rate-limit';

const router = Router();
const agentLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });

function validateAgentPayload(body) {
  const errs = [];
  if (!body) return ['Request body is required.'];
  const { description, imageBase64, experience } = body;
  if (!description && !imageBase64) errs.push('Provide either "description" or "imageBase64".');
  if (experience && !['beginner', 'intermediate', 'expert'].includes(experience)) {
    errs.push('experience must be one of: beginner, intermediate, expert');
  }
  return errs;
}

// POST /api/agent 
router.post('/', agentLimiter, async (req, res) => {  
  try {
    const errs = validateAgentPayload(req.body);
    if (errs.length) {
      return res.status(400).json({ status: 'error', code: 'BAD_REQUEST', message: errs.join(' ') });
    }

    const { description, imageBase64, experience, tools, location, clarifyAnswer } = req.body;

    try {
      const { default: runAgent } = await import('../agents/orchestrator.js');
      if (typeof runAgent === 'function') {
        const input = { userId: req.user.id, description, imageBase64, experience, tools, location, clarifyAnswer };
        const result = await runAgent(input);
      
        return res.json({ status: 'ok', result });
      }
    } catch (e) {
       console.warn('runAgent not available or failed:', e.message);
    }

    try {
      const { default: gemini } = await import('../services/gemini.js');
      const { default: youtube } = await import('../services/youtube.js');

      const analysis = gemini?.analyze
        ? await gemini.analyze({ description, imageBase64, experience, tools, clarifyAnswer })
        : null;

      const baseQuery = analysis?.item_name || description || 'repair';
      const topIssue = analysis?.issues?.[0]?.name;
      const ytQuery = topIssue ? `${baseQuery} ${topIssue} repair` : `${baseQuery} repair`;

      const videos = await youtube.search({ q: ytQuery, max: 3 });
      

      const nearby = []; 

      const merged = { analysis, videos, nearby };
      return res.json({ status: 'ok', result: merged });
    } catch (e) {
      return res.status(501).json({
        status: 'error',
        code: 'NOT_IMPLEMENTED',
        message: 'Agent pipeline not implemented on server.',
        error: e.message
      });
    }
  } catch (err) {
    console.error('POST /api/agent error:', err);
    return res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: 'Internal server error.' });
  }
});

// GET /api/search/videos?q=...
router.get('/search/videos', async (req, res) => {

});

export default router;