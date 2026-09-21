const asyncHandler = require('express-async-handler');
const Furniture = require('../models/Furniture');
const AIChat = require('../models/AIChat');
const { ApiError, success } = require('../utils/apiResponse');

/**
 * Calls the Gemini API to turn free-form room parameters into
 * a structured furniture recommendation query. Falls back gracefully
 * if GEMINI_API_KEY is not configured (AI module is optional).
 */
const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  if (!apiKey) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) {
    console.error('[Gemini] API error:', await response.text());
    return null;
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/**
 * Same as callGemini but with an image attached (vision input), used by
 * the AI Interior Design feature to analyze an uploaded room photo.
 * Fetches the already-Cloudinary-hosted image and inlines it as base64,
 * which is simpler and more portable across Gemini API versions than the
 * separate Files API. Falls back gracefully if GEMINI_API_KEY is not
 * configured, exactly like the text-only path above.
 */
const callGeminiVision = async (imageUrl, prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  if (!apiKey) return null;

  let base64Image;
  let mimeType;
  try {
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) return null;
    mimeType = imageRes.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await imageRes.arrayBuffer();
    base64Image = Buffer.from(arrayBuffer).toString('base64');
  } catch (err) {
    console.error('[Gemini Vision] Failed to fetch room photo:', err.message);
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Image } }],
        },
      ],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) {
    console.error('[Gemini Vision] API error:', await response.text());
    return null;
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/**
 * @desc    Suggest furniture based on room size, wall color, and style
 * @route   POST /api/ai/recommendations
 * @access  Private
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const { roomSizeSqm, wallColor, style, roomType } = req.body;

  const prompt = `You are an interior design assistant for a furniture app.
A user's room has: size ${roomSizeSqm || 'unspecified'} sqm, wall color ${wallColor || 'unspecified'},
style preference ${style || 'unspecified'}, room type ${roomType || 'unspecified'}.
Return ONLY a JSON object with this exact shape, no prose:
{
  "categories": ["living_room" | "bedroom" | "kitchen" | "dining" | "office" | "outdoor", ...],
  "colorPalette": ["hex1", "hex2", "hex3"],
  "materials": ["material1", "material2"],
  "reasoning": "one short sentence"
}`;

  const aiResult = await callGemini(prompt);

  // Build a MongoDB filter from either the AI's structured output or safe defaults
  const filter = { isAvailable: true };
  if (roomType) filter.roomTypes = roomType;
  if (aiResult?.materials?.length) filter.materials = { $in: aiResult.materials };

  const suggestions = await Furniture.find(filter)
    .populate('category', 'name slug')
    .sort('-ratingsAverage')
    .limit(12);

  return success(res, 200, 'Recommendations generated', {
    suggestions,
    aiInsights: aiResult || { reasoning: 'AI module not configured — showing filtered catalog matches instead.' },
  });
});

/**
 * @desc    Suggest furniture that pairs well with a given item (matching set)
 * @route   GET /api/ai/match/:furnitureId
 * @access  Private
 */
const getMatchingFurniture = asyncHandler(async (req, res) => {
  const base = await Furniture.findById(req.params.furnitureId);
  if (!base) throw new ApiError(404, 'Furniture item not found');

  const matches = await Furniture.find({
    _id: { $ne: base._id },
    category: { $ne: base.category },
    roomTypes: { $in: base.roomTypes },
    isAvailable: true,
  })
    .sort('-ratingsAverage')
    .limit(8)
    .populate('category', 'name slug');

  return success(res, 200, 'Matching furniture fetched', matches);
});

/**
 * @desc    AI Interior Design — analyze a photo of the user's room and
 *          recommend a style, color palette, layout tips, and matching
 *          catalog items spanning both furniture AND home appliances
 *          (e.g. an appropriately-sized TV or AC for the room shown).
 * @route   POST /api/ai/interior-design
 * @access  Private
 * Body (multipart/form-data): roomPhoto (file, required), roomType (optional)
 */
const analyzeRoomDesign = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'A room photo is required (field name: "roomPhoto")');

  const { roomType } = req.body;
  const roomPhotoUrl = req.file.path;

  const prompt = `You are an interior design assistant for an app that sells both furniture and home appliances (TVs, air conditioners, etc).
Look at this photo of a room and return ONLY a JSON object with this exact shape, no prose:
{
  "detectedRoomType": "living_room" | "bedroom" | "kitchen" | "dining" | "office" | "outdoor",
  "detectedStyle": "short style label, e.g. 'Scandinavian minimalist'",
  "colorPalette": ["hex1", "hex2", "hex3"],
  "layoutTips": ["short tip 1", "short tip 2"],
  "recommendedMaterials": ["material1", "material2"],
  "suggestedTvSizeInches": number or null,
  "suggestedAcBtu": number or null,
  "reasoning": "one short sentence explaining the recommendations"
}
Only set suggestedTvSizeInches / suggestedAcBtu if a TV or AC would visibly fit and make sense in this room from the photo; otherwise use null. If you do suggest an AC, estimate BTU using standard US sizing guidance (approximately 20 BTU per square foot of visible floor area, adjusted for ceiling height and window exposure visible in the photo).`;

  const aiResult = await callGeminiVision(roomPhotoUrl, prompt);
  const effectiveRoomType = aiResult?.detectedRoomType || roomType;

  const baseFilter = { isAvailable: true };
  if (effectiveRoomType) baseFilter.roomTypes = effectiveRoomType;

  const furnitureFilter = { ...baseFilter, itemType: 'furniture' };
  if (aiResult?.recommendedMaterials?.length) {
    furnitureFilter.materials = { $in: aiResult.recommendedMaterials };
  }
  const applianceFilter = { ...baseFilter, itemType: 'appliance' };

  const [recommendedFurniture, recommendedAppliances] = await Promise.all([
    Furniture.find(furnitureFilter).populate('category', 'name slug').sort('-ratingsAverage').limit(8),
    Furniture.find(applianceFilter).populate('category', 'name slug').sort('-ratingsAverage').limit(4),
  ]);

  return success(res, 200, 'Room design analyzed', {
    roomPhotoUrl,
    aiInsights: aiResult || {
      reasoning: 'AI module not configured — showing filtered catalog matches instead.',
      detectedRoomType: roomType || null,
    },
    recommendedFurniture,
    recommendedAppliances,
  });
});

/**
 * @desc    AI Visual Search — upload a photo of any furniture/appliance
 *          item (seen elsewhere — a magazine, a friend's home, etc) and
 *          find visually/stylistically similar items in the catalog.
 *          Distinct from /interior-design: this analyzes a single PRODUCT
 *          photo, not a whole room.
 * @route   POST /api/ai/visual-search
 * @access  Private
 * Body (multipart/form-data): photo (file, required)
 */
const visualSearch = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'A photo is required (field name: "photo")');

  const photoUrl = req.file.path;

  const prompt = `You are a visual product-matching assistant for an app that sells furniture and home appliances.
Look at this photo of a single product (ignore any background/room) and return ONLY a JSON object with this exact shape, no prose:
{
  "itemType": "furniture" | "appliance",
  "primaryType": "short 1-3 word product type, e.g. 'sofa', 'dining table', 'floor lamp', 'television' — or null if unclear",
  "style": "short style label, e.g. 'mid-century modern', or null",
  "materials": ["material1", "material2"],
  "colors": ["hex1", "hex2"],
  "searchKeywords": ["keyword1", "keyword2", "keyword3"]
}
If the photo does not clearly show a furniture item or home appliance, set primaryType to null and searchKeywords to [].`;

  const aiResult = await callGeminiVision(photoUrl, prompt);

  const filter = { isAvailable: true };
  if (aiResult?.itemType) filter.itemType = aiResult.itemType;
  if (aiResult?.materials?.length) filter.materials = { $in: aiResult.materials };

  const searchQuery = [aiResult?.primaryType, ...(aiResult?.searchKeywords || [])].filter(Boolean).join(' ');

  let matches = [];
  if (searchQuery) {
    matches = await Furniture.find({ ...filter, $text: { $search: searchQuery } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(12)
      .populate('category', 'name slug');
  }
  if (matches.length === 0) {
    // No text match (or AI unavailable) — fall back to a plain filtered
    // catalog browse so the feature still returns something useful.
    matches = await Furniture.find(filter).populate('category', 'name slug').sort('-ratingsAverage').limit(12);
  }

  return success(res, 200, 'Visual search complete', {
    photoUrl,
    aiInsights: aiResult || {
      primaryType: null,
      reasoning: 'AI module not configured — showing catalog matches instead.',
    },
    matches,
  });
});

// Max chat turns (user + assistant messages combined) kept per user, so
// both the stored document and the context sent to Gemini stay bounded.
const MAX_CHAT_MESSAGES = 20;

/**
 * @desc    AI Shopping Assistant — a conversational chat that can answer
 *          furniture/appliance questions and recommend catalog items,
 *          with a short rolling history for context.
 * @route   POST /api/ai/chat
 * @access  Private
 * Body: { message: string }
 */
const chatWithAssistant = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) throw new ApiError(400, 'A message is required');
  const trimmedMessage = message.trim();

  let chat = await AIChat.findOne({ user: req.user._id });
  if (!chat) chat = new AIChat({ user: req.user._id, messages: [] });

  const historyText = chat.messages
    .slice(-10)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const prompt = `You are a friendly, concise shopping assistant for a furniture and home-appliance app called AR Furniture Studio.
Conversation so far:
${historyText || '(no previous messages)'}
User: ${trimmedMessage}

Reply with ONLY a JSON object, no prose:
{
  "reply": "your conversational reply, 2-4 sentences max",
  "suggestedCategories": ["keyword1", "keyword2"]
}
Keep the tone warm and helpful. Only include suggestedCategories (product/material/style keywords to search the catalog with) if the user's message calls for recommendations; otherwise use an empty array.`;

  const aiResult = await callGemini(prompt);
  const replyText =
    aiResult?.reply ||
    "I'm not able to reach the AI assistant right now — please try again in a moment, or browse categories from the home screen.";
  const suggestedCategories = Array.isArray(aiResult?.suggestedCategories) ? aiResult.suggestedCategories : [];

  let suggestedItems = [];
  if (suggestedCategories.length) {
    const searchStr = suggestedCategories.join(' ');
    suggestedItems = await Furniture.find(
      { isAvailable: true, $text: { $search: searchStr } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(6)
      .populate('category', 'name slug');
    if (suggestedItems.length === 0) {
      suggestedItems = await Furniture.find({ isAvailable: true, materials: { $in: suggestedCategories } })
        .limit(6)
        .populate('category', 'name slug');
    }
  }

  chat.messages.push({ role: 'user', content: trimmedMessage });
  chat.messages.push({ role: 'assistant', content: replyText, suggestedCategories });
  if (chat.messages.length > MAX_CHAT_MESSAGES) {
    chat.messages = chat.messages.slice(chat.messages.length - MAX_CHAT_MESSAGES);
  }
  await chat.save();

  return success(res, 200, 'Assistant replied', { reply: replyText, suggestedCategories, suggestedItems });
});

/**
 * @desc    Fetch the current user's AI Shopping Assistant chat history
 * @route   GET /api/ai/chat/history
 * @access  Private
 */
const getChatHistory = asyncHandler(async (req, res) => {
  const chat = await AIChat.findOne({ user: req.user._id });
  return success(res, 200, 'Chat history fetched', chat?.messages || []);
});

/**
 * @desc    Clear the current user's AI Shopping Assistant chat history
 * @route   DELETE /api/ai/chat/history
 * @access  Private
 */
const clearChatHistory = asyncHandler(async (req, res) => {
  await AIChat.findOneAndUpdate({ user: req.user._id }, { messages: [] }, { upsert: true });
  return success(res, 200, 'Chat history cleared');
});

module.exports = {
  getRecommendations,
  getMatchingFurniture,
  analyzeRoomDesign,
  visualSearch,
  chatWithAssistant,
  getChatHistory,
  clearChatHistory,
};
