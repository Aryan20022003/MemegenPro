import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedMemeData } from '../types';
import { renderMemeOnCanvas, convertCanvasToDataUrl } from './imageService';
import { INTERNAL_CONTENTS, InternalContent } from './content';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MEME_TEMPLATES = [
    { id: 'distracted-boyfriend', name: 'Distracted Boyfriend', url: 'https://i.imgflip.com/1ur9b0.jpg' },
    { id: 'recursive-astronaught', name: 'Recursive astronaught where one astronught looking towards earth and other standing back of him', url: 'https://api.memegen.link/images/astronaut.jpg' },
    { id: 'diaster-girl-meme', name: 'Small Girl is looking toward buring house and smiling ', url: 'https://api.memegen.link/images/disastergirl.jpg' },
    // { id: 'woman-yelling-at-cat', name: 'Woman Yelling at a Cat', url: 'https://i.imgflip.com/3l60ph.jpg' },
    { id: 'ancient-alien-meme-temp', name: 'A guy explaining something', url: 'https://api.memegen.link/images/aag.jpg' },
    { id: 'we_are_choosen_one', name: 'We are choosen one man is shouting and fire at backhttps://api.memegen.link/images/chosen.jpg', url: 'https://api.memegen.link/images/chosen.jpg' },
    { id: 'its-doge', name: 'Depiction of a Shiba Inu with broken English captions broken english', url: 'https://api.memegen.link/images/doge.jpg' },
    { id: 'this-is-fine', name: 'dog sitting in burning home depecting everthing is fine', url: 'https://api.memegen.link/images/fine.jpg' },
    {id:'i-should-have-not-said-this',name:'Hagrit looking as if he should not have said this thing ',url:'https://api.memegen.link/images/hagrid.jpg'},
    {id:'mini-keaonireif',name:'Mini version of keanoreif standing on stage',url:'https://api.memegen.link/images/mini-keanu.jpg'}
];

export async function generateMemeFromTemplate(text: string, refinementPrompt?: string): Promise<GeneratedMemeData> {
  const prompt = `
    Analyze the following corporate text. Your goal is to create a funny, safe-for-work meme that boosts morale by finding humor in corporate life.

    First, choose the most appropriate meme template from the list below.
    Second, write the text for the meme. ALL memes have a top text and a bottom text. 
    For top text : Generate a formal, technical, or corporate-jargon phrase from the document that 
    sounds complex or official. 
    For bottom text : According to the meme template which you have selected Create a simple, relatable, and lighthearted explanation 
    or reaction or commnet of the top-line phrase. The tone should be positive and encouraging, aiming to make 
    the concept accessible and interesting
    Note : Make top and bottom text not more than 5 words each.

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

    let selectedTemplate = MEME_TEMPLATES.find(t => t.id === parsed.templateId);

    if (!selectedTemplate) {
        console.warn(`AI returned an invalid templateId: "${parsed.templateId}". Using a random template as a fallback.`);
        selectedTemplate = MEME_TEMPLATES[Math.floor(Math.random() * MEME_TEMPLATES.length)];
    }
    console.log(parsed);
    const canvas = await renderMemeOnCanvas(selectedTemplate.url, parsed.topText, parsed.bottomText);
    const finalImageUrl = await convertCanvasToDataUrl(canvas);

    return { imageUrl: finalImageUrl };

  } catch (e) {
    console.error("Failed to parse AI response or render meme:", response.text, e);
    throw new Error("Could not understand the AI's creative vision or render the image. Please try again.");
  }
}

export async function fetchInternalContent(): Promise<InternalContent> {
    // Simulate an API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Select a random piece of content from the imported array
    const randomIndex = Math.floor(Math.random() * INTERNAL_CONTENTS.length);
    return INTERNAL_CONTENTS[randomIndex];
}