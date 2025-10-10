import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Interviews table - stores interview session metadata
export const interviews = pgTable("interviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  duration: integer("duration").notNull().default(0), // in seconds
  status: text("status").notNull().default("completed"), // "in_progress" | "completed"
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  overallScore: integer("overall_score").default(0), // 0-100
});

// Questions asked during interview
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interviewId: varchar("interview_id").notNull().references(() => interviews.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  aiGenerated: integer("ai_generated").notNull().default(1), // 1 = true, 0 = false (SQLite compatibility)
  order: integer("order").notNull(),
});

// Transcript entries with timestamps
export const transcripts = pgTable("transcripts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interviewId: varchar("interview_id").notNull().references(() => interviews.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  timestamp: real("timestamp").notNull(), // seconds from start
  speaker: text("speaker").notNull().default("user"), // "user" | "interviewer"
});

// Emotion detection entries with timestamps
export const emotions = pgTable("emotions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interviewId: varchar("interview_id").notNull().references(() => interviews.id, { onDelete: "cascade" }),
  emotion: text("emotion").notNull(), // "neutral", "happy", "sad", "angry", "surprised", "fearful"
  confidence: real("confidence").notNull(), // 0-1
  timestamp: real("timestamp").notNull(), // seconds from start
});

// AI analysis and feedback
export const analysis = pgTable("analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interviewId: varchar("interview_id").notNull().references(() => interviews.id, { onDelete: "cascade" }),
  feedback: text("feedback").notNull(),
  strengths: jsonb("strengths").notNull().default([]), // array of strings
  improvements: jsonb("improvements").notNull().default([]), // array of strings
  scores: jsonb("scores").notNull().default({}), // object with score categories
});

// Insert schemas
export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertTranscriptSchema = createInsertSchema(transcripts).omit({
  id: true,
});

export const insertEmotionSchema = createInsertSchema(emotions).omit({
  id: true,
});

export const insertAnalysisSchema = createInsertSchema(analysis).omit({
  id: true,
});

// TypeScript types
export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type Transcript = typeof transcripts.$inferSelect;
export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;

export type Emotion = typeof emotions.$inferSelect;
export type InsertEmotion = z.infer<typeof insertEmotionSchema>;

export type Analysis = typeof analysis.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;

// Extended types for frontend use
export type InterviewWithDetails = Interview & {
  questions?: Question[];
  transcripts?: Transcript[];
  emotions?: Emotion[];
  analysis?: Analysis;
};
