// backend/api/endpoints.js
// Main API routes for Fix-Buddy
// - POST /api/agent        → runs AI pipeline (Gemini + optional YouTube/Places)
// - GET  /api/search/videos?q=...   → YouTube helper (optional)
// - GET  /api/search/places?lat=&lng=&query=... → Places helper (optional)

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Diagnosis } from '../models/schema.js';

const router = Router();

/* ---------------------- Router-level middleware ---------------------- */

// Simple rate limiter for the agent endpoint to avoid abuse
const agentLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });

// NOTE: caching headers helper removed per request; reverse proxies or clients may still cache responses if configured.
function validateAgentPayload(body) {
  const errs = [];
  if (!body) {
    return ['Request body is required.'];
  }

  const { description, imageBase64, experience, tools, location, clarifyAnswer } = body;

  // Need at least one of description or imageBase64
  if (!description && !imageBase64) {
    errs.push('Provide either "description" or "imageBase64".');
  }

  // Validate experience level if provided
  if (experience && !['beginner', 'intermediate', 'expert'].includes(experience)) {
    errs.push('experience must be one of: beginner, intermediate, expert');
  }

  return errs;
}


/* -------------------------------- Routes ------------------------------ */

// POST /api/agent  → main pipeline
router.post('/agent', agentLimiter, async (req, res) => {
  try {
    // 1) Validate input early
    const errs = validateAgentPayload(req.body);
    if (errs.length) {
      return res.status(400).json({ status: 'error', code: 'BAD_REQUEST', message: errs.join(' ') });
    }

    const { description, imageBase64, experience, tools, location, clarifyAnswer } = req.body;

    // 2) Try your full agent orchestrator (preferred)
    try {
      // eslint-disable-next-line global-require
      const { default: runAgent } = await import('../agent/runAgent.js');
      if (typeof runAgent === 'function') {
        const input = { description, imageBase64, experience, tools, location, clarifyAnswer };
        const result = await runAgent(input);

        // Save diagnosis history if user is authenticated
        if (req.user?.userId && result?.itemName) {
          const diagnosis = new Diagnosis({
            userId: req.user.userId,
            itemName: result.itemName,
            itemModel: result.itemModel || result.brand_model,
            repairabilityScore: result.repairability?.score,
            issues: result.issues?.map(issue => ({ problem: issue.name })) || [],
            diagnosis: {
              safety: result.diy?.safety,
              tools: result.diy?.tools || [],
              steps: result.diy?.steps || [],
              parts: result.diy?.parts?.map(part => ({
                name: part.name,
                estimatedCost: part.cost || part.estimatedCost
              })) || []
            },
            nearbyShops: result.nearby?.map(shop => ({
              name: shop.name,
              address: shop.address,
              rating: shop.rating,
              placeId: shop.place_id || shop.placeId
            })) || [],
            tutorials: result.videos?.map(video => ({
              title: video.title,
              url: video.url,
              source: 'youtube'
            })) || []
          });
          await diagnosis.save();
        }

        return res.json({ status: 'ok', result });
      }
    } catch (e) {
      // If agent isn’t implemented yet, fall through to tool-level fallback
      // console.warn('runAgent not available:', e.message);
    }

    // 3) Fallback: call tools directly if present (minimal orchestration)
    try {
      // Dynamic imports for tools
      const { default: gemini } = await import('../tools/gemini.js');
      const { default: youtube } = await import('../tools/youtube.js');
      const { default: places } = await import('../tools/places.js');

      const analysis = gemini?.analyze
        ? await gemini.analyze({ description, imageBase64, skillLevel, tools, clarifyAnswer })
        : null;

      const baseQuery =
        analysis?.item_name ||
        analysis?.item ||
        description ||
        'repair';

      const topIssue = analysis?.issues?.[0]?.name;
      const ytQuery = topIssue ? `${baseQuery} ${topIssue} repair` : `${baseQuery} repair`;

      const videosPromise = youtube?.search
        ? youtube.search({ q: ytQuery, max: 3 })
        : Promise.resolve([]);

      const placesPromise =
        location && places?.search
          ? places.search({
            location: { lat: Number(location.lat), lng: Number(location.lng) },
            query: `${baseQuery} repair`,
            max: 3
          })
          : Promise.resolve([]);

      // We allow partial success (e.g., videos succeeds, places fails)
      const [videosRes, placesRes] = await Promise.allSettled([videosPromise, placesPromise]);
      const videos = videosRes.status === 'fulfilled' ? videosRes.value : [];
      const nearby = placesRes.status === 'fulfilled' ? placesRes.value : [];

      const merged = { analysis, videos, nearby };
      return res.json({ status: 'ok', result: merged });
    } catch (e) {
      // Tools missing or error on require → clear guidance for implementers
      return res.status(501).json({
        status: 'error',
        code: 'NOT_IMPLEMENTED',
        message: 'Agent pipeline not implemented on server.',
        hint:
          'Create `backend/agent/runAgent.js` (async) that accepts {description, imageBase64, skillLevel, tools, location, clarifyAnswer}\n' +
          'and returns: { item_name, brand_model?, repairability:{score,confidence}, issues:[{name,probability}], diy?:{safety,tools[],time_minutes,steps[],parts[]},\n' +
          'links:[{title,url}], blocked:boolean, confidence_overall:number, videos:[], nearby:[] }',
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
  try {
    const q = String(req.query.q || req.query.query || 'repair tutorial');

    try {
      // eslint-disable-next-line global-require
      const youtube = require('../tools/youtube');
      if (youtube && typeof youtube.search === 'function') {
        const list = await youtube.search({ q, max: 3 });
        return res.json({ status: 'ok', videos: list });
      }
    } catch {
      // fallthrough to 501
    }

    return res.status(501).json({
      status: 'error',
      code: 'NOT_IMPLEMENTED',
      message: 'YouTube search not implemented. Create `backend/tools/youtube.js` exporting `search({ q, max })`.'
    });
  } catch (err) {
    console.error('GET /api/search/videos error:', err);
    return res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: 'Internal server error.' });
  }
});


export default router;
