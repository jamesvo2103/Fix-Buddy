// backend/tools/gemini.js
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default {
  async analyze({ description, imageBase64, experience = "beginner", tools = [] }) {
    const parts = [
      { text: `You are Fix-Buddy. Return ONLY a single JSON object (no prose, no markdown).` },
      { text: `Schema fields: item_name, brand_model, repairability{score,confidence}, issues:[{name,probability}], diy{safety:[],tools:[{name:"..."}],steps:[{instruction:"..."}],parts:[{name:"...", est_cost_usd:10.50}]}, blocked.` },
      { text: `If dangerous (gas/electrical mains/structural/pressurized/hazardous), set blocked=true.` },
      { text: `USER PROFILE: ${JSON.stringify({ experience, toolsOwned: tools })}` },
      { text: `REPAIR PROBLEM: ${description || "(no description)"}` },
    ];

    if (imageBase64) {
      const cleaned = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({ inlineData: { mimeType: "image/jpeg", data: cleaned } });
    }

    try {
      const resp = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json" },
      });

      const text = typeof resp?.response?.text === "function" ? resp.response.text() : "";
      let data = null;
      if (text && text.trim().startsWith("{")) {
        try { data = JSON.parse(text); } catch {}
      }
      if (!data) {
        const m = String(text || "").match(/\{[\s\S]*\}$/);
        data = m ? JSON.parse(m[0]) : null;
      }

      if (!data) {
        // minimal safe fallback
        data = {
          item_name: description ? "Unknown Item" : null,
          brand_model: null,
          repairability: { score: 40, confidence: "low" },
          issues: [],
          diy: { safety: ["Use PPE"], tools: ["screwdriver"], steps: ["Provide more detail"], parts: [] },
          blocked: false,
        };
      }

      return {
        item_name: data.item_name || (description ? "Unknown Item" : null),
        brand_model: data.brand_model || null,
        repairability: data.repairability || { score: 0, confidence: "low" },
        issues: Array.isArray(data.issues) ? data.issues : [],
        diy: {
          safety: Array.isArray(data.diy?.safety) ? data.diy.safety : ["Safety information not available"],
          tools: Array.isArray(data.diy?.tools) ? data.diy.tools : [],
          steps: Array.isArray(data.diy?.steps) ? data.diy.steps : [],
          parts: Array.isArray(data.diy?.parts) ? data.diy.parts : [],
        },
        blocked: Boolean(data.blocked),
      };
    } catch (err) {
      console.warn("Gemini analysis failed:", err.message);
      return {
        item_name: description ? "Unknown Item" : null,
        brand_model: null,
        repairability: { score: 0, confidence: "low" },
        issues: [],
        diy: { safety: ["Unable to analyze"], tools: [], steps: [], parts: [] },
        blocked: false,
      };
    }
  },
};
