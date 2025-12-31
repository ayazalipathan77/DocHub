import { GoogleGenAI } from "@google/genai";
import { DocumentData } from "../types";

// Helper to initialize AI client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a summary and tags for a newly uploaded document.
 */
export const analyzeDocument = async (text: string): Promise<{ summary: string; tags: string[] }> => {
  const ai = getAiClient();
  if (!ai) return { summary: "AI unavailable", tags: [] };

  try {
    const prompt = `
      Analyze the following document text. 
      1. Provide a concise 2-sentence summary.
      2. Provide up to 5 relevant tags (lowercase, comma-separated).
      
      Return the output as JSON in the following format:
      {
        "summary": "...",
        "tags": ["tag1", "tag2"]
      }

      Document Text (truncated):
      ${text.substring(0, 5000)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      summary: result.summary || "No summary generated.",
      tags: result.tags || []
    };
  } catch (error) {
    console.error("Error analyzing document:", error);
    return { summary: "Analysis failed.", tags: [] };
  }
};

/**
 * Performs a "RAG" style search/answer generation.
 * It takes the user query and a list of potentially relevant document snippets,
 * and asks Gemini to synthesize an answer or identify the best match.
 */
export const searchWithAI = async (query: string, candidates: DocumentData[]): Promise<{ answer: string; relevantDocIds: string[] }> => {
  const ai = getAiClient();
  if (!ai) return { answer: "", relevantDocIds: [] };

  if (candidates.length === 0) return { answer: "No documents found to analyze.", relevantDocIds: [] };

  try {
    // Prepare context from candidates
    const context = candidates.map(doc => `
      ---
      ID: ${doc.id}
      Title: ${doc.title}
      Content Snippet: ${doc.rawText.substring(0, 1000)}...
      ---
    `).join('\n');

    const prompt = `
      You are an intelligent knowledge base assistant.
      User Query: "${query}"

      Here are some documents from the company database:
      ${context}

      Task:
      1. Identify which documents are most relevant to the query.
      2. Provide a direct answer to the user's query based ONLY on the provided information.
      3. If the answer is found in a specific document, cite it.

      Return JSON:
      {
        "answer": "Your answer here...",
        "relevantDocIds": ["id1", "id2"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      answer: result.answer || "Could not generate an answer.",
      relevantDocIds: result.relevantDocIds || []
    };

  } catch (error) {
    console.error("Error in AI search:", error);
    return { answer: "", relevantDocIds: [] };
  }
};
