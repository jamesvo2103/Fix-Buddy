// backend/api/agent.routes.js
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
// --- FIXED IMPORT ---
// No longer need to import Diagnosis here, orchestrator handles it

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

// POST /api/agent  → main pipeline
router.post('/', agentLimiter, async (req, res) => { // Note: Changed to '/' since api/index.js prefixes '/agent'
  try {
    // 1) Validate input early
    const errs = validateAgentPayload(req.body);
    if (errs.length) {
      return res.status(400).json({ status: 'error', code: 'BAD_REQUEST', message: errs.join(' ') });
    }

    const { description, imageBase64, experience, tools, location, clarifyAnswer } = req.body;

    // 2) Try your full agent orchestrator (preferred)
    try {
      // --- FIXED PATH: "agents" (plural) ---
      const { default: runAgent } = await import('../agents/orchestrator.js');
      if (typeof runAgent === 'function') {
        const input = { userId: req.user.id, description, imageBase64, experience, tools, location, clarifyAnswer };
        const result = await runAgent(input);
        
        // --- REMOVED DUPLICATE SAVE BLOCK ---
        // orchestrator.js now handles all saving.
        
        return res.json({ status: 'ok', result });
      }
    } catch (e) {
       console.warn('runAgent not available or failed:', e.message);
       // Fall through to fallback
    }

    // 3) Fallback: call tools directly
    try {
      const { default: gemini } = await import('../services/gemini.js');
      const { default: youtube } = await import('../services/youtube.js');
      // const { default: places } = await import('../services/places.js'); // You don't have this file, so commenting out

      const analysis = gemini?.analyze
        ? await gemini.analyze({ description, imageBase64, experience, tools, clarifyAnswer })
        : null;

      const baseQuery = analysis?.item_name || description || 'repair';
      const topIssue = analysis?.issues?.[0]?.name;
      const ytQuery = topIssue ? `${baseQuery} ${topIssue} repair` : `${baseQuery} repair`;

      const videos = await youtube.search({ q: ytQuery, max: 3 });
      
      // Not running places search since file is missing
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
  // ... (This route looks correct, but I'm removing it since api/index.js doesn't route it)
  // ... If you want this route, add it to api/index.js
});

export default router;