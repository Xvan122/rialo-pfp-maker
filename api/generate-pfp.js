const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
  // CORS untuk GitHub Pages
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const prompt = `
Create a flat modern avatar profile picture for the Rialo community.
Style: clean flat design, minimal, futuristic crypto-native vibe.
Circular composition, centered character, no text in the image.
Character should feel like an onchain degen but friendly.
Character name (inspiration only, do NOT draw text): "${name}".
`.trim();

    const model = genAI.getGenerativeModel({
      // model multimodal yang bisa output image
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: ["text", "image"],
      },
    });

    const result = await model.generateContent(prompt);

    const parts = result.response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(
      (p) => p.inlineData && p.inlineData.data && p.inlineData.mimeType
    );

    if (!imagePart) {
      console.error("No image part in response:", result.response);
      return res
        .status(500)
        .json({ error: "No image data returned from Gemini" });
    }

    // langsung kirim base64 ke frontend
    return res.status(200).json({
      imageBase64: imagePart.inlineData.data,
    });
  } catch (err) {
    console.error("Gemini error:", err);
    return res
      .status(500)
      .json({ error: "Failed to generate PFP", detail: err.message });
  }
};
