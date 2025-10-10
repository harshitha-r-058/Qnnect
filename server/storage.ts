import { db } from "./db";
import { 
  interviews, 
  questions, 
  transcripts, 
  emotions, 
  analysis,
  type Interview,
  type InsertInterview,
  type Question,
  type InsertQuestion,
  type Transcript,
  type InsertTranscript,
  type Emotion,
  type InsertEmotion,
  type Analysis,
  type InsertAnalysis,
  type InterviewWithDetails
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Interviews
  getAllInterviews(): Promise<Interview[]>;
  getInterview(id: string): Promise<Interview | undefined>;
  getInterviewWithDetails(id: string): Promise<InterviewWithDetails | undefined>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: string, updates: Partial<InsertInterview>): Promise<Interview | undefined>;
  
  // Questions
  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestionsByInterview(interviewId: string): Promise<Question[]>;
  
  // Transcripts
  createTranscript(transcript: InsertTranscript): Promise<Transcript>;
  getTranscriptsByInterview(interviewId: string): Promise<Transcript[]>;
  createTranscripts(transcriptsList: InsertTranscript[]): Promise<Transcript[]>;
  
  // Emotions
  createEmotion(emotion: InsertEmotion): Promise<Emotion>;
  getEmotionsByInterview(interviewId: string): Promise<Emotion[]>;
  createEmotions(emotionsList: InsertEmotion[]): Promise<Emotion[]>;
  
  // Analysis
  createAnalysis(analysisData: InsertAnalysis): Promise<Analysis>;
  getAnalysisByInterview(interviewId: string): Promise<Analysis | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Interviews
  async getAllInterviews(): Promise<Interview[]> {
    return await db.select().from(interviews).orderBy(desc(interviews.createdAt));
  }

  async getInterview(id: string): Promise<Interview | undefined> {
    const result = await db.select().from(interviews).where(eq(interviews.id, id)).limit(1);
    return result[0];
  }

  async getInterviewWithDetails(id: string): Promise<InterviewWithDetails | undefined> {
    const interview = await this.getInterview(id);
    if (!interview) return undefined;

    const [interviewQuestions, interviewTranscripts, interviewEmotions, interviewAnalysis] = await Promise.all([
      this.getQuestionsByInterview(id),
      this.getTranscriptsByInterview(id),
      this.getEmotionsByInterview(id),
      this.getAnalysisByInterview(id),
    ]);

    return {
      ...interview,
      questions: interviewQuestions,
      transcripts: interviewTranscripts,
      emotions: interviewEmotions,
      analysis: interviewAnalysis,
    };
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const result = await db.insert(interviews).values(interview).returning();
    return result[0];
  }

  async updateInterview(id: string, updates: Partial<InsertInterview>): Promise<Interview | undefined> {
    const result = await db.update(interviews)
      .set(updates)
      .where(eq(interviews.id, id))
      .returning();
    return result[0];
  }

  // Questions
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const result = await db.insert(questions).values(question).returning();
    return result[0];
  }

  async getQuestionsByInterview(interviewId: string): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.interviewId, interviewId));
  }

  // Transcripts
  async createTranscript(transcript: InsertTranscript): Promise<Transcript> {
    const result = await db.insert(transcripts).values(transcript).returning();
    return result[0];
  }

  async getTranscriptsByInterview(interviewId: string): Promise<Transcript[]> {
    return await db.select().from(transcripts).where(eq(transcripts.interviewId, interviewId));
  }

  async createTranscripts(transcriptsList: InsertTranscript[]): Promise<Transcript[]> {
    if (transcriptsList.length === 0) return [];
    const result = await db.insert(transcripts).values(transcriptsList).returning();
    return result;
  }

  // Emotions
  async createEmotion(emotion: InsertEmotion): Promise<Emotion> {
    const result = await db.insert(emotions).values(emotion).returning();
    return result[0];
  }

  async getEmotionsByInterview(interviewId: string): Promise<Emotion[]> {
    return await db.select().from(emotions).where(eq(emotions.interviewId, interviewId));
  }

  async createEmotions(emotionsList: InsertEmotion[]): Promise<Emotion[]> {
    if (emotionsList.length === 0) return [];
    const result = await db.insert(emotions).values(emotionsList).returning();
    return result;
  }

  // Analysis
  async createAnalysis(analysisData: InsertAnalysis): Promise<Analysis> {
    const result = await db.insert(analysis).values(analysisData).returning();
    return result[0];
  }

  async getAnalysisByInterview(interviewId: string): Promise<Analysis | undefined> {
    const result = await db.select().from(analysis).where(eq(analysis.interviewId, interviewId)).limit(1);
    return result[0];
  }
}

export const storage = new DatabaseStorage();
