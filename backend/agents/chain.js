import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is not set.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


const emptyToUndefined = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  z.any().optional()
);


const DiagnosisSchema = z.object({
  item_name: z.string().nullable().describe("The specific name of the item, e.g., 'Wooden dining chair'"),
  brand_model: z.string().nullable().describe("The brand or model, if identifiable"),
  repairability: z.object({
    score: z.number().min(0).max(100),
    confidence: z.enum(["low", "medium", "high"]),
    reasons: z.array(z.string()).optional(),
  }),
  issues: z.array(z.object({
    name: z.string().describe("Short name of the problem, e.g., 'Cracked leg joint'"),
    probability: z.number().min(0).max(1),
    description: z.string().optional(),
    

    severity: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          const lower = val.toLowerCase().trim();
          if (lower === "low" || lower === "medium" || lower === "high") {
            return lower; 
          }
        }
        return undefined; 
      },
      z.enum(["low","medium","high"]).optional() 
    ),

  })).min(1),
});


const GuidanceSchema = z.object({
  diy: z.object({
    safety: z.array(z.string()).min(1),
    tools: z.array(z.object({
      name: z.string(),
      required: z.boolean().default(true),
    })).default([]),

  
    skill_required: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          const lower = val.toLowerCase().trim();
          if (lower === "beginner" || lower === "intermediate" || lower === "expert") {
            return lower; 
          }
        }
        return undefined; 
      },
      z.enum(["beginner","intermediate","expert"]).optional()
    ),

    time_minutes: z.preprocess(
      (val) => (val === null ? undefined : val),
       z.number().nonnegative().optional() 
    ),
    
    preparation: z.array(z.string()).default([]),
    steps: z.array(z.object({
      instruction: z.string(),
      warning: z.string().optional(),
    })).min(1),
    parts: z.array(z.object({
      name: z.string(),
      quantity: z.number().positive().default(1),
      est_cost_usd: z.number().optional(),
    })).default([]),
  }),
  blocked: z.boolean().default(false),
  block_reason: z.string().optional(),
  risk_level: z.enum(["low","medium","high"]).default("low"),
  confidence_overall: z.number().min(0).max(1),
});


function makeDiagnosisPrompt({ description }) {
  const guard = "OUTPUT RULES: Return ONLY a single JSON object (no prose, no markdown, no ```). The JSON MUST match the field names exactly.";
  const task = `YOUR TASK:
You are an expert repair diagnostician. You will receive a text description and an image of a broken item.
Your ONLY job is to identify the item and the problem.
1.  **Prioritize the IMAGE.**
2.  Identify the specific object (e.g., "wooden chair", "plastic coffee maker").
3.  Identify the clear damage or failure (e.g., "cracked leg joint", "leaking water").
4.  Assess repairability.
Return ONLY the JSON for this diagnosis. DO NOT provide repair steps.`;

  return [
    { text: guard },
    { text: task },
    { text: `USER PROBLEM: ${description || "(no description)"}` },
    { text: `JSON TEMPLATE (types only): ${JSON.stringify({
        item_name: "string",
        brand_model: "string|null",
        repairability: { score: 50, confidence: "low", reasons: ["..."] },
        issues: [{ name: "string", probability: 0.8, description: "...", severity: "medium" }]
      })}` },
    { text: "Return the final diagnosis JSON now." },
  ];
}


function makeGuidancePrompt({ userProfile, diagnosis, clarify }) {
  const guard = "OUTPUT RULES: Return ONLY a single JSON object (no prose, no markdown, no ```). The JSON MUST match the field names exactly.";
  const safety = `SAFETY: You are a CAUTIOUS assistant.
- IF a repair involves: gas, mains voltage, live electrical, SET "blocked": true.
- ALWAYS provide clear safety warnings in the "diy.safety" array.`;
  const task = `YOUR TASK:
You are a helpful DIY repair assistant. You will receive a user's profile and a pre-made diagnosis.
Your ONLY job is to generate the step-by-step guidance to fix the problem.
1.  **Use the Diagnosis:** The problem is already identified. DO NOT change it.
2.  **Personalize:** Tailor all steps, tools, and warnings to the user's "experience" level.
3.  **Be Specific:** Instead of "Fix the leg," write "1. Clean dried glue... 2. Apply new wood glue... 3. Clamp..."`;

  return [
    { text: guard },
    { text: safety },
    { text: task },
    { text: `USER PROFILE: ${JSON.stringify(userProfile)}` },
    { text: `DIAGNOSIS TO FIX: ${JSON.stringify(diagnosis)}` },
    ...(clarify ? [{ text: `USER CLARIFICATION: ${clarify}` }] : []),
    { text: `JSON TEMPLATE (types only): ${JSON.stringify({
        diy: { safety: ["..."], tools: [{name: "..."}], skill_required: userProfile.experience, time_minutes: 30, preparation: ["..."], steps: [{instruction: "..."}], parts: [{name: "..."}] },
        blocked: false,
        risk_level: "low",
        confidence_overall: 0.8
      })}` },
    { text: "Return the final guidance JSON now." },
  ];
}


async function parseModelResponse(modelResponse, zodSchema) {
  const text = typeof modelResponse?.response?.text === "function" 
    ? modelResponse.response.text() 
    : (modelResponse?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "");

  let data = null;
  if (text && text.trim().startsWith("{")) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.warn("Initial JSON.parse failed. Trying to salvage.", e.message);
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          data = JSON.parse(match[0]);
        } catch (salvageError) {
          console.error("Failed to salvage JSON:", salvageError.message);
        }
      }
    }
  }
  if (!data) throw new Error("Model returned empty or invalid JSON response.");
  
  const parsed = zodSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Zod schema validation failed:", parsed.error.errors);
    throw new Error(`Model output failed schema validation: ${parsed.error.message}`);
  }
  return parsed.data;
}


export async function runDiagnosisChain({ description, imageBase64 }) {
  const parts = makeDiagnosisPrompt({ description });
  if (imageBase64) {
    const cleaned = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    parts.push({ inlineData: { mimeType: "image/jpeg", data: cleaned } });
  }
  try {
    const res = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: { responseMimeType: "application/json" },
    });
    return await parseModelResponse(res, DiagnosisSchema);
  } catch (err) {
    console.error("runDiagnosisChain execution failed:", err);
    throw new Error(`Diagnosis chain failed: ${err.message}`);
  }
}


export async function runGuidanceChain({ userProfile, history, diagnosis, clarifyAnswer }) {
  const parts = makeGuidancePrompt({
    userProfile,
    diagnosis,
    clarify: clarifyAnswer,
  });
  try {
    const res = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: { responseMimeType: "application/json" },
    });
    return await parseModelResponse(res, GuidanceSchema);
  } catch (err) {
    console.error("runGuidanceChain execution failed:", err);
    throw new Error(`Guidance chain failed: ${err.message}`);
  }
}