const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    suggestedCategories: [{ type: String, trim: true }],
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

/**
 * One document per user, holding a rolling chat history with the AI
 * Shopping Assistant. Kept capped at the most recent MAX_MESSAGES turns
 * (see aiController.chatWithAssistant) so the document — and the context
 * sent to Gemini on every turn — never grows unbounded.
 */
const aiChatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    messages: [chatMessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIChat', aiChatSchema);
