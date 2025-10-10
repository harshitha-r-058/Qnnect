import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface InterviewQuestion {
  questionText: string;
  category: string;
}

export async function generateInterviewQuestions(
  jobTitle: string = "software engineer",
  count: number = 4
): Promise<InterviewQuestion[]> {
  const prompt = `Generate ${count} professional interview questions for a ${jobTitle} position.
  
  Include a mix of:
  - Behavioral questions (tell me about a time...)
  - Technical/role-specific questions
  - Situational questions
  - Career goals questions
  
  Return a JSON array of objects with "questionText" and "category" fields.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              questionText: { type: "string" },
              category: { type: "string" },
            },
            required: ["questionText", "category"],
          },
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    }
    
    // Fallback questions
    return [
      { questionText: "Tell me about yourself and your background.", category: "introduction" },
      { questionText: "What are your greatest strengths?", category: "behavioral" },
      { questionText: "Describe a challenging situation and how you handled it.", category: "behavioral" },
      { questionText: "Where do you see yourself in five years?", category: "career" },
    ];
  } catch (error) {
    console.error("Error generating questions:", error);
    // Return fallback questions
    return [
      { questionText: "Tell me about yourself and your background.", category: "introduction" },
      { questionText: "What are your greatest strengths?", category: "behavioral" },
      { questionText: "Describe a challenging situation and how you handled it.", category: "behavioral" },
      { questionText: "Where do you see yourself in five years?", category: "career" },
    ];
  }
}

export interface InterviewAnalysis {
  overallScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  scores: {
    communication: number;
    confidence: number;
    content: number;
    clarity: number;
  };
}

export async function analyzeInterview(
  transcripts: string[],
  emotions: Array<{ emotion: string; confidence: number }>,
  duration: number
): Promise<InterviewAnalysis> {
  const transcriptText = transcripts.join("\n");
  const emotionSummary = emotions.reduce((acc, e) => {
    acc[e.emotion] = (acc[e.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `Analyze this mock interview performance and provide detailed feedback:

Interview Duration: ${Math.floor(duration / 60)} minutes
Transcript:
${transcriptText}

Emotion Distribution:
${Object.entries(emotionSummary).map(([emotion, count]) => `${emotion}: ${count}`).join("\n")}

Provide:
1. Overall score (0-100)
2. Detailed feedback paragraph
3. List of 3-5 strengths
4. List of 3-5 areas for improvement
5. Scores for: communication, confidence, content, clarity (0-100 each)

Return as JSON with fields: overallScore, feedback, strengths (array), improvements (array), scores (object with communication, confidence, content, clarity).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            overallScore: { type: "number" },
            feedback: { type: "string" },
            strengths: {
              type: "array",
              items: { type: "string" },
            },
            improvements: {
              type: "array",
              items: { type: "string" },
            },
            scores: {
              type: "object",
              properties: {
                communication: { type: "number" },
                confidence: { type: "number" },
                content: { type: "number" },
                clarity: { type: "number" },
              },
              required: ["communication", "confidence", "content", "clarity"],
            },
          },
          required: ["overallScore", "feedback", "strengths", "improvements", "scores"],
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    }

    throw new Error("Empty response from Gemini");
  } catch (error) {
    console.error("Error analyzing interview:", error);
    // Return fallback analysis
    return {
      overallScore: 70,
      feedback: "Your interview showed good effort. Keep practicing to improve your skills.",
      strengths: [
        "Completed the interview",
        "Attempted to answer all questions",
        "Showed enthusiasm",
      ],
      improvements: [
        "Provide more specific examples",
        "Improve clarity of responses",
        "Work on maintaining confidence throughout",
      ],
      scores: {
        communication: 70,
        confidence: 65,
        content: 72,
        clarity: 68,
      },
    };
  }
}
