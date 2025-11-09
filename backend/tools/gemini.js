import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default {
      async analyze({ description, imageBase64, experience = 'beginner', tools = [] }) {
            const prompt = `You are Fix-Buddy, a repair diagnosis assistant. Analyze the repair issue and provide a structured diagnosis.

User Profile:
- Experience Level: ${experience}
- Available Tools: ${tools.join(', ') || 'basic tools'}

Return your analysis as JSON with this EXACT structure:
{
  "item_name": "Name of the item to repair",
  "brand_model": "Brand and model if visible",
  "repairability": {
    "score": <number 0-100>,
    "confidence": "low|medium|high"
  },
  "issues": [
    {
      "name": "Clear description of the issue",
      "probability": <number 0-1>
    }
  ],
  "diy": {
    "safety": ["Important safety precautions"],
    "tools": ["Required tools", "One per line"],
    "steps": ["Clear step-by-step instructions", "Suitable for ${experience} level"],
    "parts": [
      {
        "name": "Required part name",
        "est_cost_usd": <estimated cost in USD>
      }
    ]
  },
  "blocked": <true if repair is dangerous for DIY>
}

IMPORTANT:
- Assess if repair is dangerous (gas, electrical, structural) and set blocked=true
- Adapt steps to user's experience level
- Ensure all arrays have at least one item
- Provide specific tool requirements
- Include clear safety warnings`;

            const inputs = [prompt];

            if (description) {
                  inputs.push(`REPAIR PROBLEM: ${description}`);
            }

            if (imageBase64) {
                  inputs.push({
                        inlineData: {
                              data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
                              mimeType: "image/jpeg",
                        },
                  });
            }

            try {
                  const result = await model.generateContent(inputs);
                  const text = result.response.text();
                  const data = JSON.parse(text);

                  // Ensure required fields exist
                  return {
                        item_name: data.item_name || (description ? "Unknown Item" : null),
                        brand_model: data.brand_model || null,
                        repairability: data.repairability || { score: 0, confidence: "low" },
                        issues: Array.isArray(data.issues) ? data.issues : [],
                        diy: {
                              safety: Array.isArray(data.diy?.safety) ? data.diy.safety : ["Safety information not available"],
                              tools: Array.isArray(data.diy?.tools) ? data.diy.tools : [],
                              steps: Array.isArray(data.diy?.steps) ? data.diy.steps : [],
                              parts: Array.isArray(data.diy?.parts) ? data.diy.parts : []
                        },
                        blocked: Boolean(data.blocked)
                  };
            } catch (err) {
                  console.warn('Gemini analysis failed:', err.message);
                  return {
                        item_name: description ? "Unknown Item" : null,
                        brand_model: null,
                        repairability: { score: 0, confidence: "low" },
                        issues: [],
                        diy: {
                              safety: ["Unable to analyze the repair requirements"],
                              tools: [],
                              steps: [],
                              parts: []
                        },
                        blocked: false
                  };
            }
      },
};
