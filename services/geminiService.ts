import { GoogleGenAI, Type } from "@google/genai";
import { AlchemyElement, FusionResult } from "../types";

// Initialize the API client
// Note: process.env.API_KEY is assumed to be available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fuseElements = async (
  elementA: AlchemyElement,
  elementB: AlchemyElement
): Promise<FusionResult> => {
  const modelId = "gemini-2.5-flash"; // Using Flash for speed and reasoning

  const prompt = `
    User is playing an "Infinite Craft" style game.
    Combine these two elements into a new, logical, and creative result:
    Element 1: ${elementA.emoji} ${elementA.name}
    Element 2: ${elementB.emoji} ${elementB.name}

    Rules:
    1. Result must be a noun or specific concept.
    2. Result must have a relevant single emoji.
    3. Be creative but logical (e.g., Fire + Water = Steam).
    4. If the combination is extremely abstract, default to something funny or philosophical.
    5. 'name' should be in the same language as the input (if mixed, default to Chinese).
    6. Keep the name short (max 2-3 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The name of the new element (e.g., 'Steam')" },
            emoji: { type: Type.STRING, description: "A single emoji representing the new element" },
            description: { type: Type.STRING, description: "A very short witty explanation of why this formed." }
          },
          required: ["name", "emoji"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as FusionResult;
    return result;

  } catch (error) {
    console.error("Fusion failed:", error);
    // Fallback in case of API error to prevent game lock
    return {
      name: "Glitch",
      emoji: "👾",
      description: " The universe blinked."
    };
  }
};