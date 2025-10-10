import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInterviewSchema, insertQuestionSchema, insertTranscriptSchema, insertEmotionSchema, insertAnalysisSchema } from "@shared/schema";
import { generateInterviewQuestions, analyzeInterview } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all interviews
  app.get("/api/interviews", async (req, res) => {
    try {
      const allInterviews = await storage.getAllInterviews();
      res.json(allInterviews);
    } catch (error: any) {
      console.error("Error fetching interviews:", error);
      res.status(500).json({ error: "Failed to fetch interviews" });
    }
  });

  // Get single interview with details
  app.get("/api/interviews/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const interview = await storage.getInterviewWithDetails(id);
      
      if (!interview) {
        return res.status(404).json({ error: "Interview not found" });
      }
      
      res.json(interview);
    } catch (error: any) {
      console.error("Error fetching interview:", error);
      res.status(500).json({ error: "Failed to fetch interview" });
    }
  });

  // Create new interview
  app.post("/api/interviews", async (req, res) => {
    try {
      const validated = insertInterviewSchema.parse(req.body);
      const interview = await storage.createInterview(validated);
      res.json(interview);
    } catch (error: any) {
      console.error("Error creating interview:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid interview data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create interview" });
    }
  });

  // Update interview
  app.put("/api/interviews/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const interview = await storage.updateInterview(id, updates);
      
      if (!interview) {
        return res.status(404).json({ error: "Interview not found" });
      }
      
      res.json(interview);
    } catch (error: any) {
      console.error("Error updating interview:", error);
      res.status(500).json({ error: "Failed to update interview" });
    }
  });

  // Note: Video upload now happens client-side directly to Supabase Storage
  // The frontend uploads the video and thumbnail, then sends the URLs to the server via PUT /api/interviews/:id

  // Generate AI questions
  app.post("/api/questions/generate", async (req, res) => {
    try {
      const { jobTitle, count } = req.body;
      const questions = await generateInterviewQuestions(jobTitle, count);
      res.json(questions);
    } catch (error: any) {
      console.error("Error generating questions:", error);
      res.status(500).json({ error: "Failed to generate questions" });
    }
  });

  // Save questions for interview
  app.post("/api/interviews/:id/questions", async (req, res) => {
    try {
      const { id } = req.params;
      const { questions: questionsList } = req.body;

      if (!Array.isArray(questionsList)) {
        return res.status(400).json({ error: "Questions must be an array" });
      }

      const savedQuestions = await Promise.all(
        questionsList.map((q, index) =>
          storage.createQuestion({
            interviewId: id,
            questionText: q.questionText,
            aiGenerated: q.aiGenerated ? 1 : 0,
            order: index,
          })
        )
      );

      res.json(savedQuestions);
    } catch (error: any) {
      console.error("Error saving questions:", error);
      res.status(500).json({ error: "Failed to save questions" });
    }
  });

  // Save transcripts
  app.post("/api/interviews/:id/transcripts", async (req, res) => {
    try {
      const { id } = req.params;
      const { transcripts: transcriptsList } = req.body;

      if (!Array.isArray(transcriptsList)) {
        return res.status(400).json({ error: "Transcripts must be an array" });
      }

      const validated = transcriptsList.map((t) => ({
        interviewId: id,
        text: t.text,
        timestamp: t.timestamp,
        speaker: t.speaker || "user",
      }));

      const savedTranscripts = await storage.createTranscripts(validated);
      res.json(savedTranscripts);
    } catch (error: any) {
      console.error("Error saving transcripts:", error);
      res.status(500).json({ error: "Failed to save transcripts" });
    }
  });

  // Save emotions
  app.post("/api/interviews/:id/emotions", async (req, res) => {
    try {
      const { id } = req.params;
      const { emotions: emotionsList } = req.body;

      if (!Array.isArray(emotionsList)) {
        return res.status(400).json({ error: "Emotions must be an array" });
      }

      const validated = emotionsList.map((e) => ({
        interviewId: id,
        emotion: e.emotion,
        confidence: e.confidence,
        timestamp: e.timestamp,
      }));

      const savedEmotions = await storage.createEmotions(validated);
      res.json(savedEmotions);
    } catch (error: any) {
      console.error("Error saving emotions:", error);
      res.status(500).json({ error: "Failed to save emotions" });
    }
  });

  // Analyze interview and save analysis
  app.post("/api/interviews/:id/analyze", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Fetch interview data
      const interview = await storage.getInterviewWithDetails(id);
      if (!interview) {
        return res.status(404).json({ error: "Interview not found" });
      }

      // Prepare data for analysis
      const transcriptTexts = interview.transcripts?.map((t) => t.text) || [];
      const emotionData = interview.emotions?.map((e) => ({
        emotion: e.emotion,
        confidence: e.confidence,
      })) || [];

      // Run AI analysis
      const analysisResult = await analyzeInterview(
        transcriptTexts,
        emotionData,
        interview.duration
      );

      // Save analysis
      const savedAnalysis = await storage.createAnalysis({
        interviewId: id,
        feedback: analysisResult.feedback,
        strengths: analysisResult.strengths,
        improvements: analysisResult.improvements,
        scores: analysisResult.scores,
      });

      // Update interview with overall score
      await storage.updateInterview(id, {
        overallScore: analysisResult.overallScore,
      });

      res.json(savedAnalysis);
    } catch (error: any) {
      console.error("Error analyzing interview:", error);
      res.status(500).json({ error: "Failed to analyze interview" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
