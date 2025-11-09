import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  // LangChain reads GOOGLE_API_KEY by default; pass explicit to be safe:
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
});

// zod schema for the JSON we want back
const ResultSchema = z.object({
  // Core item identification
  item_name: z.string().nullable(),
  brand_model: z.string().nullable(),

  // Repairability assessment
  repairability: z.object({
    score: z.number().min(0).max(100),
    confidence: z.enum(["low", "medium", "high"]),
    reasons: z.array(z.string()).optional()
  }),

  // Issue identification
  issues: z.array(z.object({
    name: z.string(),
    probability: z.number().min(0).max(1),
    description: z.string().optional(),
    severity: z.enum(["low", "medium", "high"]).optional()
  })).default([]),

  // DIY repair guide
  diy: z.object({
    // Safety and requirements
    safety: z.array(z.string()).min(1),
    tools: z.array(z.object({
      name: z.string(),
      required: z.boolean().default(true),
      alternatives: z.array(z.string()).optional()
    })).default([]),
    skill_required: z.enum(["beginner", "intermediate", "expert"]).default("beginner"),
    time_minutes: z.number().positive(),

    // Repair process
    preparation: z.array(z.string()).default([]),
    steps: z.array(z.object({
      instruction: z.string(),
      warning: z.string().optional(),
      tip: z.string().optional()
    })).min(1),

    // Parts and materials
    parts: z.array(z.object({
      name: z.string(),
      quantity: z.number().positive().default(1),
      est_cost_usd: z.number().optional(),
      required: z.boolean().default(true),
      alternatives: z.array(z.string()).optional()
    })).default([])
  }).required(),

  // Risk assessment
  blocked: z.boolean().default(false),
  block_reason: z.string().optional(),
  risk_level: z.enum(["low", "medium", "high"]).default("low"),

  // Confidence scoring
  confidence_overall: z.number().min(0).max(1)
});

export async function runFixBuddyChain({
  userProfile,
  history = [],
  description,
  imageBase64,
  clarifyAnswer
}) {
  const sys = `
You are Fix-Buddy, a cautious and thorough DIY repair assistant. Your goal is to provide safe, personalized repair guidance while strictly adhering to safety protocols.

USER PROFILE:
Experience Level: ${userProfile.experience}
Available Tools: ${JSON.stringify(userProfile.toolsOwned || [])}
Language: ${userProfile.language || "en"}
Risk Tolerance: ${userProfile.riskTolerance || "low"}

CORE PRINCIPLES:
1. Safety First - Always evaluate risks thoroughly
2. Personalization - Adapt to user's experience and tools
3. Clarity - Provide detailed, step-by-step instructions
4. Caution - When in doubt, recommend professional help

SAFETY BLOCKS:
Block repairs involving:
- Gas systems or leaks
- Live electrical mains
- HVAC/Refrigeration
- Structural modifications
- Pressurized systems
- Hazardous materials (asbestos, lead)
- Complex automotive systems
- Industrial equipment

RESPONSE REQUIREMENTS:
1. Match schema exactly
2. Always include safety warnings
3. Provide detailed tool requirements
4. List required skills and time estimates
5. Include preparation steps
6. Offer alternative approaches when possible

CONFIDENCE SCORING:
- Assess repair difficulty vs user experience
- Consider tool availability
- Factor in safety risks
- Account for repair complexity

Respond ONLY in strict JSON format matching the provided schema.
`;

  // Build message list for the chat call
  const messages = [
    { role: "system", content: sys },
    ...history,
    { role: "user", content: `Task description: ${description || "(no description)"}` }
  ];

  if (clarifyAnswer) {
    messages.push({ role: "user", content: `Clarification: ${clarifyAnswer}` });
  }

  // If there is an image, add it as inlineData content block
  const imageBlock = imageBase64
    ? [{
      type: "input_image",
      image_url: undefined,
      inlineData: {
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
        mimeType: "image/jpeg"
      }
    }]
    : [];

  // Add repair complexity guidance based on user experience
  const complexityGuide = {
    beginner: "Focus on simple repairs. Provide extra safety context and basic tool guidance.",
    intermediate: "Can handle moderate complexity. Include some advanced techniques with caution.",
    expert: "Capable of complex repairs. Include technical details and efficiency tips."
  };

  try {
    const res = await model.invoke([
      ...messages.map(m => ({ role: m.role, content: m.content })),
      {
        role: "user",
        content: `Experience-based guidance: ${complexityGuide[userProfile.experience] || complexityGuide.beginner}`
      },
      ...(imageBlock.length ? [{ role: "user", content: imageBlock }] : [])
    ]);

    const text = res?.content?.[0]?.text ?? res?.content ?? "";

    // Enhanced JSON parsing with multiple fallbacks
    let data;
    try {
      // Direct parse attempt
      data = JSON.parse(text);
    } catch (parseErr) {
      try {
        // Try to extract JSON block from text
        const match = String(text).match(/\{[\s\S]*\}$/);
        if (match) {
          data = JSON.parse(match[0]);
        } else {
          // Try to find any JSON-like structure
          const jsonMatch = String(text).match(/\{(?:[^{}]|(\{[^{}]*\}))*\}/);
          data = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        }
      } catch {
        console.warn("Failed to parse LLM response as JSON");
        data = {};
      }
    }

    // Validate with schema
    const parsed = ResultSchema.safeParse(data);
    if (!parsed.success) {
      console.warn("Schema validation failed:", parsed.error.issues);

      // Attempt to construct a valid response from partial data
      const partial = {
        item_name: data.item_name || description?.split(" ")[0] || null,
        brand_model: data.brand_model || null,
        repairability: {
          score: typeof data.repairability?.score === 'number' ? data.repairability.score : 50,
          confidence: "low",
          reasons: ["Partial data recovery from invalid response"]
        },
        issues: Array.isArray(data.issues) ? data.issues.map(i => ({
          name: i.name || "Unknown Issue",
          probability: i.probability || 1,
          severity: "high"
        })) : [],
        diy: {
          safety: Array.isArray(data.diy?.safety) ? data.diy.safety : ["Proceed with extreme caution - response validation failed"],
          tools: [],
          skill_required: userProfile.experience || "beginner",
          time_minutes: 0,
          preparation: ["Unable to provide detailed preparation steps"],
          steps: [{
            instruction: "Please request clarification - unable to provide reliable repair steps",
            warning: "Response validation failed"
          }],
          parts: []
        },
        blocked: true,
        block_reason: "Response validation failed - requires clarification",
        risk_level: "high",
        confidence_overall: 0.1
      };

      return partial;
    }

    return parsed.data;
  } catch (err) {
    console.error("Chain execution failed:", err);
    return {
      item_name: null,
      brand_model: null,
      repairability: {
        score: 0,
        confidence: "low",
        reasons: ["Analysis failed"]
      },
      issues: [],
      diy: {
        safety: ["Unable to analyze repair requirements"],
        tools: [],
        skill_required: "beginner",
        time_minutes: 0,
        preparation: ["Analysis failed"],
        steps: [{
          instruction: "Please try again - system error occurred",
          warning: "Unable to provide repair guidance"
        }],
        parts: []
      },
      blocked: true,
      block_reason: "System error - " + err.message,
      risk_level: "high",
      confidence_overall: 0
    };
  }
}
