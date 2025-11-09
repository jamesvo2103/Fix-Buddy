// backend/llm/history.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["system", "user", "assistant"], required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "image", "diagnosis", "clarification", "safety", "summary"],
      default: "text",
    },
    metadata: {
      diagnosisId: { type: mongoose.Schema.Types.ObjectId, ref: "Diagnosis" },
      imageId: String,
      confidence: Number,
      riskLevel: { type: String, enum: ["low", "medium", "high"] },
      blocked: Boolean,
      toolsRequired: [String],
      timeEstimate: Number,
      skillRequired: { type: String, enum: ["beginner", "intermediate", "expert"] },
    },
  },
  { _id: false, timestamps: true }
);

const ConversationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, index: true, required: true },
    messages: { type: [MessageSchema], default: [] },
    activeRepair: {
      itemName: String,
      brandModel: String,
      started: Date,
      completed: Boolean,
      diagnosisId: { type: mongoose.Schema.Types.ObjectId, ref: "Diagnosis" },
    },
    stats: {
      totalRepairs: { type: Number, default: 0 },
      lastActive: Date,
      experienceLevel: {
        type: String,
        enum: ["beginner", "intermediate", "expert"],
        default: "beginner",
      },
      toolsOwned: [String],
    },
  },
  { timestamps: true }
);

// Proper indexes
ConversationSchema.index({ userId: 1, "activeRepair.completed": 1 });
ConversationSchema.index({ userId: 1, "stats.lastActive": -1 });

const Conversation =
  mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);

export async function getHistory(userId, options = {}) {
  const { limit = 12, type = null, includeMetadata = false, activeRepairOnly = false } = options;

  const conv = await Conversation.findOne({ userId }).lean();
  if (!conv) return [];

  let msgs = conv.messages || [];

  if (type) msgs = msgs.filter((m) => m.type === type);
  if (activeRepairOnly && conv.activeRepair?.diagnosisId) {
    msgs = msgs.filter((m) => String(m.metadata?.diagnosisId || "") === String(conv.activeRepair.diagnosisId));
  }

  // Update last active (best-effort, non-blocking)
  try {
    await Conversation.updateOne({ _id: conv._id }, { $set: { "stats.lastActive": new Date() } });
  } catch {}

  if (!includeMetadata) {
    msgs = msgs.map(({ metadata, ...rest }) => rest);
  }

  return msgs.slice(-limit);
}

export async function appendHistory(userId, newMessages, options = {}) {
  const { cap = 20, updateStats = true, diagnosisId = null, skillRequired = null } = options;

  const conv =
    (await Conversation.findOne({ userId })) ||
    new Conversation({ userId, messages: [], stats: { lastActive: new Date() } });

  const enhanced = (newMessages || []).map((msg) => ({
    ...msg,
    metadata: {
      ...(msg.metadata || {}),
      diagnosisId: diagnosisId || msg.metadata?.diagnosisId,
      skillRequired: skillRequired || msg.metadata?.skillRequired,
    },
  }));

  conv.messages.push(...enhanced);
  if (conv.messages.length > cap) conv.messages = conv.messages.slice(-cap);

  if (updateStats) conv.stats.lastActive = new Date();

  await conv.save();
  return conv.toObject();
}

export async function startRepair(userId, repair) {
  const { itemName, brandModel, diagnosisId } = repair || {};
  const conv = await Conversation.findOne({ userId });
  if (!conv) throw new Error("Conversation not found");

  if (conv.activeRepair && !conv.activeRepair.completed) conv.activeRepair.completed = true;

  conv.activeRepair = {
    itemName: itemName || null,
    brandModel: brandModel || null,
    diagnosisId: diagnosisId || null,
    started: new Date(),
    completed: false,
  };

  await conv.save();
  return conv.toObject();
}

export async function getRepairStats(userId) {
  const conv = await Conversation.findOne({ userId }).lean();
  if (!conv) return null;

  return {
    activeRepair: conv.activeRepair,
    stats: conv.stats,
    progress: {
      totalRepairs: conv.stats.totalRepairs,
      experienceLevel: conv.stats.experienceLevel,
      toolsOwned: conv.stats.toolsOwned,
      lastActive: conv.stats.lastActive,
    },
  };
}
