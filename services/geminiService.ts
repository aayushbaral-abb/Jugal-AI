import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

export const generateResponse = async (
  apiKey: string,
  prompt: string,
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Using gemini-2.5-flash with Google Search grounding
    const model = 'gemini-2.5-flash';

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }], // Enable search for broader knowledge
      },
      history: history,
    });

    const result = await chat.sendMessage({ message: prompt });
    
    let responseText = result.text || "I'm sorry, I couldn't generate a response.";

    // Extract and append sources from Google Search grounding metadata
    const candidate = result.candidates?.[0];
    if (candidate?.groundingMetadata?.groundingChunks) {
      const chunks = candidate.groundingMetadata.groundingChunks;
      const uniqueLinks = new Map<string, string>();

      // Collect unique links
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          uniqueLinks.set(chunk.web.uri, chunk.web.title);
        }
      });

      // Append formatted sources to the response text
      if (uniqueLinks.size > 0) {
        responseText += "\n\n**Sources:**\n";
        uniqueLinks.forEach((title, uri) => {
          responseText += `- [${title}](${uri})\n`;
        });
      }
    }
    
    return responseText;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Check for Quota Exceeded (429 or specific error messages)
    const isQuotaError = 
      error.status === 429 || 
      error.code === 429 ||
      (error.message && (
        error.message.includes('429') || 
        error.message.toLowerCase().includes('resource exhausted') || 
        error.message.toLowerCase().includes('quota')
      ));

    if (isQuotaError) {
      throw new Error("QUOTA_EXCEEDED");
    }

    throw error;
  }
};