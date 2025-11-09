// backend/agents/orchestrator.js
import youtube from "../services/youtube.js";
import geminiTool from "../services/gemini.js";
// --- FIXED IMPORTS ---
import { User as UserModel } from "../models/User.js";
import { Diagnosis as DiagnosisModel } from "../models/Diagnosis.js";
import { getHistory as getChatHistory, appendHistory as updateChatHistory } from "../models/Conversation.js";
import { runDiagnosisChain, runGuidanceChain } from "./chain.js";

const DANGEROUS = [
  "gas leak", "natural gas", "live mains", "mains voltage", "refrigerant", "carbon monoxide", "line voltage",
  "hvac", "wiring fault", "electrocution"
];

/** Normalize chain or gemini output to DB schema */
function normalizeResult(partial = {}) {
  const toolsArr = Array.isArray(partial.diy?.tools) ? partial.diy.tools : [];
  const stepsArr = Array.isArray(partial.diy?.steps) ? partial.diy.steps : [];
  const tools = toolsArr.map(t => typeof t === "string" ? t : (t?.name || "")).filter(Boolean);
  const steps = stepsArr.map(s => typeof s === "string" ? s : (s?.instruction || "")).filter(Boolean);
  
  const partsArr = Array.isArray(partial.diy?.parts) ? partial.diy.parts : [];
  const parts = partsArr.map(p => {
    if (typeof p === "string") return { name: p, estimatedCost: null };
    return {
      name: p.name,
      estimatedCost: p.est_cost_usd || p.estimatedCost || null,
    };
  }).filter(p => p.name);

  return {
    itemName: partial.item_name ?? null,
    itemModel: partial.brand_model ?? null,
    repairabilityScore: partial.repairability?.score ?? 0,
    repairabilityConfidence: partial.repairability?.confidence ?? "low",
    issues: Array.isArray(partial.issues)
      ? partial.issues.map((issue) => ({
          problem: issue.name || issue.problem,
          probability: issue.probability ?? 1,
        }))
      : [],
    diagnosis: {
      safety: Array.isArray(partial.diy?.safety)
        ? partial.diy.safety.join(". ")
        : "No safety instructions available.",
      tools,
      timeEstimate: partial.diy?.time_minutes ?? null,
      steps,
      parts,
    },
    tutorials: Array.isArray(partial.videos)
      ? partial.videos.map((v) => ({
          title: v.title,
          url: v.url,
          source: "youtube",
        }))
      : [],
    blocked: Boolean(partial.blocked),
    confidence: partial.confidence_overall ?? 0,
  };
}

/**
 * Main Repair Agent Entry Point
 */
export default async function runAgent(payload) {
  const {
    userId = null,
    description = "",
    imageBase64 = null,
    experience = "beginner",
    tools = [],
    clarifyAnswer = null,
  } = payload || {};

  // 1️⃣ Load user profile & history
  let profile = { experience, toolsOwned: tools, language: "en", riskTolerance: "low" };
  let history = [];
  if (userId) {
    try {
      const user = await UserModel.findById(userId).lean();
      if (user) {
        profile = {
          experience: user.experience || experience,
          toolsOwned: Array.isArray(user.toolsOwned) ? user.toolsOwned : tools,
          language: user.language || "en",
          riskTolerance: user.riskTolerance || "low",
        };
      }
      history = await getChatHistory(userId, { limit: 8 });
    } catch (e) {
      console.warn("⚠️ Failed to load user context:", e.message);
    }
  }

  // 2️⃣ --- REFACTORED: Run 2-step chain → fallback to Gemini ---
  let analysis;
  try {
    // Step 2a: Run Diagnosis Chain
    console.log("Running Diagnosis Chain...");
    const diagnosisResult = await runDiagnosisChain({ description, imageBase64 });

    // Step 2b: Run Guidance Chain
    console.log("Running Guidance Chain...");
    const guidanceResult = await runGuidanceChain({
      userProfile: profile,
      history,
      diagnosis: diagnosisResult,
      clarifyAnswer,
    });

    // Step 2c: Combine results
    analysis = { ...diagnosisResult, ...guidanceResult };

  } catch (e) {
    console.warn("⚠️ 2-Step Chain analysis failed, fallback to basic Gemini:", e.message);
    analysis = await geminiTool.analyze({
      description,
      imageBase64,
      experience: profile.experience,
      tools: profile.toolsOwned,
      clarifyAnswer,
    });
  }

  // Guarantee minimal shape (This logic is still needed for the fallback)
  analysis = {
    item_name: analysis?.item_name || null,
    brand_model: analysis?.brand_model || null,
    repairability: analysis?.repairability || { score: 0, confidence: "low" },
    issues: Array.isArray(analysis?.issues) ? analysis.issues : [],
    diy: {
      safety: Array.isArray(analysis?.diy?.safety) ? analysis.diy.safety : ["Safety information not available"],
      tools: Array.isArray(analysis?.diy?.tools) ? analysis.diy.tools : [],
      steps: Array.isArray(analysis?.diy?.steps) ? analysis.diy.steps : [],
      parts: Array.isArray(analysis.diy?.parts) ? analysis.diy.parts : [], // Pass array, normalizeResult will handle format
      time_minutes: analysis?.diy?.time_minutes ?? null,
    },
    blocked: Boolean(analysis?.blocked),
    confidence_overall: analysis?.confidence_overall ?? 0,
    videos: analysis?.videos ?? [],
  };

  // 3️⃣ Safety hard-block
  const blob = JSON.stringify({ description, analysis }).toLowerCase();
  const dangerWord = DANGEROUS.find((k) => blob.includes(k));
  if (dangerWord || analysis.blocked) {
    return {
      itemName: analysis.item_name || "Unknown Item",
      issues: [{ problem: "Safety Hazard Detected" }],
      diagnosis: {
        safety: `This repair involves ${dangerWord || "unsafe conditions"} and requires professional attention.`,
        tools: [],
        steps: ["Please contact a certified professional for this repair."],
        parts: [],
      },
      tutorials: [],
      blocked: true,
      confidence: 0,
    };
  }

  // 4️⃣ YouTube tutorials
  const searchQuery = analysis.item_name
    ? `${analysis.item_name} ${analysis.issues?.[0]?.name || analysis.issues?.[0]?.problem || ""} repair`
    : `${description || "repair"} guide`;
  let tutorials = [];
  try {
    const videos = await youtube.search({ q: searchQuery, max: 3, experience: profile.experience });
    tutorials = videos.map((v) => ({
      title: v.title,
      url: v.url,
      source: "youtube",
      thumbnail: v.thumbnailUrl,
      description: v.description,
      published: v.publishedAt,
    }));
  } catch (e) {
    console.warn("⚠️ YouTube fetch failed:", e.message);
  }

  // 5️⃣ Normalize & save
  const result = normalizeResult({ ...analysis, videos: tutorials });

  if (userId) {
    try {
      const diagnosis = new DiagnosisModel({ userId, ...result });
      await diagnosis.save();
      await updateChatHistory(userId, [
        {
          role: "user",
          type: "text",
          content: `Problem: ${description || "(no description)"}${clarifyAnswer ? `\nFollow-up: ${clarifyAnswer}` : ""}`,
          metadata: { diagnosisId: diagnosis._id },
        },
        {
          role: "assistant",
          type: "diagnosis",
          content: JSON.stringify({
            itemName: result.itemName,
            issues: result.issues,
            steps: result.diagnosis.steps,
          }),
          metadata: { diagnosisId: diagnosis._id },
        },
      ]);
    } catch (e) {
      console.warn("⚠️ Persist failed:", e.message);
    }
  }

  return result;
}