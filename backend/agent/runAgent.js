// backend/agent/runAgent.js
// Orchestrates the FixBuddy AI pipeline:
// 1. Gets user profile and chat history
// 2. Uses LangChain for personalized analysis (fallback to basic Gemini)
// 3. Enriches with YouTube tutorials
// 4. Saves diagnosis and updates chat history
// Exports: default async function(payload) → result object

import yt from '../tools/youtube.js';
import gemini from '../tools/gemini.js';
import { User, Diagnosis } from '../models/schema.js';
import { runFixBuddyChain } from '../llm/chain.js';
import { getHistory, appendHistory } from '../llm/history.js';

import yt from '../tools/youtube.js';
import gemini from '../tools/gemini.js';
import { User, Diagnosis } from '../models/schema.js';
import { runFixBuddyChain } from '../llm/chain.js';
import { getHistory, appendHistory } from '../llm/history.js';

/** Simple safety keywords for hard blocks. */
const DANGEROUS = [
      'gas leak',
      'live mains',
      'refrigerant',
      'structural',
      'asbestos',
      'pressurized',
      'carbon monoxide',
];

/** Helper to format results according to our schema */
function normalizeResult(partial = {}) {
      return {
            itemName: partial.item_name ?? null,
            itemModel: partial.brand_model ?? null,
            repairabilityScore: partial.repairability?.score ?? 0,
            repairabilityConfidence: partial.repairability?.confidence ?? "low",
            issues: Array.isArray(partial.issues)
                  ? partial.issues.map(issue => ({
                        problem: issue.name,
                        probability: issue.probability ?? 1
                  }))
                  : [],
            diagnosis: {
                  safety: Array.isArray(partial.diy?.safety) ? partial.diy.safety.join('. ') : '',
                  tools: partial.diy?.tools ?? [],
                  timeEstimate: partial.diy?.time_minutes,
                  steps: partial.diy?.steps ?? [],
                  parts: partial.diy?.parts?.map(part => ({
                        name: part.name,
                        estimatedCost: part.est_cost_usd
                  })) ?? []
            },
            tutorials: Array.isArray(partial.videos)
                  ? partial.videos.map(v => ({
                        title: v.title,
                        url: v.url,
                        source: 'youtube'
                  }))
                  : [],
            blocked: Boolean(partial.blocked),
            confidence: partial.confidence_overall ?? 0
      };
}

/**
 * Main agent function that orchestrates the repair analysis workflow
 * @param {{
 *   userId?: string|null,
 *   description?: string,
 *   imageBase64?: string,
 *   experience?: 'beginner'|'intermediate'|'expert',
 *   tools?: string[],
 *   clarifyAnswer?: string
 * }} payload
 */
export default async function runAgent(payload) {
      const {
            userId = null,
            description = '',
            imageBase64 = null,
            experience = 'beginner',
            tools = [],
            clarifyAnswer = null,
      } = payload || {};

      // --- 1) Get user profile and history if authenticated ---
      let profile = {
            experience,
            toolsOwned: tools,
            language: 'en',
            riskTolerance: 'low'
      };

      let history = [];
      if (userId) {
            try {
                  // Get user profile
                  const user = await User.findById(userId);
                  if (user) {
                        profile = {
                              experience: user.experience || experience,
                              toolsOwned: Array.isArray(user.toolsOwned) ? user.toolsOwned : tools,
                              language: user.language || 'en',
                              riskTolerance: user.riskTolerance || 'low'
                        };
                  }

                  // Get chat history
                  history = await getHistory(userId, 8);
            } catch (err) {
                  console.warn('Failed to fetch user context:', err.message);
            }
      }

      // --- 2) Try LangChain analysis first, fallback to basic Gemini ---
      let analysis;
      try {
            analysis = await runFixBuddyChain({
                  userProfile: profile,
                  history,
                  description,
                  imageBase64,
                  clarifyAnswer
            });
      } catch (err) {
            console.warn('LangChain analysis failed, falling back to basic Gemini:', err.message);
            analysis = await gemini.analyze({
                  description,
                  imageBase64,
                  experience: profile.experience,
                  tools: profile.toolsOwned,
                  clarifyAnswer
            });
      }

      // Ensure required fields exist
      analysis = {
            item_name: analysis?.item_name || null,
            brand_model: analysis?.brand_model || null,
            repairability: analysis?.repairability || { score: 0, confidence: "low" },
            issues: Array.isArray(analysis?.issues) ? analysis.issues : [],
            diy: {
                  safety: Array.isArray(analysis?.diy?.safety) ? analysis.diy.safety : ["Safety information not available"],
                  tools: Array.isArray(analysis?.diy?.tools) ? analysis.diy.tools : [],
                  steps: Array.isArray(analysis?.diy?.steps) ? analysis.diy.steps : [],
                  parts: Array.isArray(analysis?.diy?.parts) ? analysis.diy.parts : []
            },
            blocked: Boolean(analysis?.blocked)
      };

      // --- 3) Safety check ---
      const blob = JSON.stringify(analysis || {}).toLowerCase();
      const dangerWord = DANGEROUS.find(k => blob.includes(k));
      if (dangerWord || analysis?.blocked) {
            return {
                  itemName: analysis?.item_name || 'Unknown Item',
                  issues: [{ problem: 'Safety Hazard Detected' }],
                  diagnosis: {
                        safety: `This repair involves ${dangerWord || 'unsafe conditions'} and requires professional attention.`,
                        tools: [],
                        steps: ['Please contact a certified professional for this repair.'],
                        parts: []
                  },
                  tutorials: []
            };
      }

      // --- 4) Find relevant tutorials ---
      const searchQuery = analysis?.item_name
            ? `${analysis.item_name} ${analysis.issues?.[0]?.name || ''} repair`
            : `${description || 'repair'} guide`;

      let tutorials = [];
      try {
            const videos = await yt.search({ q: searchQuery, max: 3 });
            tutorials = videos.map(v => ({
                  title: v.title,
                  url: v.url,
                  source: 'youtube'
            }));
      } catch (err) {
            console.warn('Failed to fetch tutorials:', err.message);
      }

      // --- 5) Format result ---
      const result = normalizeResult({ ...analysis, videos: tutorials });

      // --- 6) Save diagnosis and update chat history if authenticated ---
      if (userId) {
            try {
                  // Save diagnosis
                  const diagnosis = new Diagnosis({
                        userId,
                        ...result
                  });
                  await diagnosis.save();

                  // Update chat history
                  await appendHistory(userId, [
                        {
                              role: 'user',
                              content: `Problem: ${description || '(no description)'}\n${clarifyAnswer ? `Follow-up: ${clarifyAnswer}` : ''}`
                        },
                        {
                              role: 'assistant',
                              content: JSON.stringify({
                                    itemName: result.itemName,
                                    issues: result.issues,
                                    diagnosis: {
                                          safety: result.diagnosis.safety,
                                          steps: result.diagnosis.steps
                                    }
                              })
                        }
                  ]);
            } catch (err) {
                  console.warn('Failed to save user data:', err.message);
            }
      }

      return result;
}
