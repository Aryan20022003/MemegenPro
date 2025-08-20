import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedMemeData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MEME_TEMPLATES = [
    { id: 'distracted-boyfriend', name: 'Distracted Boyfriend', url: 'https://i.imgflip.com/1ur9b0.jpg' },
    { id: 'drake-hotline-bling', name: 'Drake Hotline Bling', url: 'https://i.imgflip.com/30b1gx.jpg' },
    { id: 'two-buttons', name: 'Two Buttons', url: 'https://i.imgflip.com/1g8my4.jpg' },
    { id: 'woman-yelling-at-cat', name: 'Woman Yelling at a Cat', url: 'https://i.imgflip.com/3l60ph.jpg' },
    { id: 'this-is-fine', name: 'This Is Fine', url: 'https://i.imgflip.com/1otk95.jpg' },
    { id: 'expanding-brain', name: 'Expanding Brain', url: 'https://i.imgflip.com/1jwhww.jpg' },
    { id: 'success-kid', name: 'Success Kid', url: 'https://i.imgflip.com/1b42wl.jpg' },
];

export async function generateMemeFromTemplate(text: string, refinementPrompt?: string): Promise<GeneratedMemeData> {
  const prompt = `
    Analyze the following corporate text. Your goal is to create a funny, safe-for-work meme that boosts morale by finding humor in corporate life.

    First, choose the most appropriate meme template from the list below.
    Second, write the text for the meme. Most memes have a top text and a bottom text. If a text area is not needed for the meme format (e.g., Success Kid usually only has one line), return an empty string for the unused text area.

    Available Templates:
    ---
    ${MEME_TEMPLATES.map(t => `- id: "${t.id}", name: "${t.name}"`).join('\n')}
    ---

    Corporate Text:
    ---
    ${text}
    ---
    
    ${refinementPrompt ? `
    Refinement Instruction:
    ---
    ${refinementPrompt}
    ---
    Based on the instruction, please regenerate the meme text or choose a better template.
    ` : ''}

    Return a JSON object with three properties:
    1. "templateId": The id of the chosen meme template (e.g., "distracted-boyfriend").
    2. "topText": The text that should appear at the top of the meme.
    3. "bottomText": The text that should appear at the bottom of the meme.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          templateId: {
            type: Type.STRING,
            description: "The ID of the chosen meme template from the list.",
          },
          topText: {
            type: Type.STRING,
            description: "The text for the top of the meme. Can be empty.",
          },
          bottomText: {
            type: Type.STRING,
            description: "The text for the bottom of the meme. Can be empty.",
          },
        },
        required: ["templateId", "topText", "bottomText"],
      },
    },
  });

  try {
    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString) as { templateId: string; topText: string; bottomText: string; };
    if (typeof parsed.topText === 'undefined' || typeof parsed.bottomText === 'undefined' || !parsed.templateId) {
        throw new Error("Invalid response structure from AI.");
    }

    const selectedTemplate = MEME_TEMPLATES.find(t => t.id === parsed.templateId);

    if (!selectedTemplate) {
        console.warn(`AI returned an invalid templateId: "${parsed.templateId}". Using a random template as a fallback.`);
        const fallbackTemplate = MEME_TEMPLATES[Math.floor(Math.random() * MEME_TEMPLATES.length)];
        return { topText: parsed.topText, bottomText: parsed.bottomText, imageUrl: fallbackTemplate.url };
    }

    return { topText: parsed.topText, bottomText: parsed.bottomText, imageUrl: selectedTemplate.url };
  } catch (e) {
    console.error("Failed to parse AI response:", response.text, e);
    throw new Error("Could not understand the AI's creative vision. Please try again.");
  }
}
