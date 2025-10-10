# Qnnect - AI Mock Interview Platform

## Overview
Qnnect is an AI-powered mock interview platform with real-time video analysis, emotion detection, and personalized feedback. The application uses browser-based technologies for video capture and analysis to minimize server load while providing comprehensive interview practice and performance insights.

## Recent Changes (October 10, 2025)
- Initial project setup with complete data schema and frontend implementation
- Created comprehensive interview management system with dashboard, list, room, and playback views
- Implemented browser-based video recording with MediaRecorder API
- Added real-time emotion detection using face-api.js (client-side TensorFlow.js)
- Integrated Web Speech API for live transcription
- Implemented **client-side direct upload to Supabase Storage** (no server size limits!)
- Added Gemini AI integration for question generation and interview analysis
- Built analytics dashboard for tracking interview performance over time
- Added settings page for customizing video, audio, and notification preferences
- Configured dark mode theme with professional purple/charcoal color scheme
- Set up Sidebar navigation with responsive design

## Project Architecture

### Technology Stack
**Frontend:**
- React with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Shadcn UI components with Tailwind CSS
- MediaRecorder API (browser-based video capture)
- face-api.js (client-side emotion detection via TensorFlow.js)
- Web Speech API (browser-based transcription)
- Canvas API (thumbnail generation)

**Backend:**
- Express.js server
- PostgreSQL database via Supabase
- Supabase Storage for video files (.webm format)
- Google Gemini API for AI analysis and question generation
- Drizzle ORM for type-safe database queries

### Data Model
**Database Tables:**
- `interviews` - Interview session metadata (title, duration, scores, video URLs)
- `questions` - Questions asked during interviews (with AI-generated flag)
- `transcripts` - Speech-to-text entries with timestamps
- `emotions` - Emotion detection data points with confidence scores
- `analysis` - AI-generated feedback, strengths, improvements, and detailed scores

## Key Features

### 1. Interview Recording (Browser-based)
- Uses `navigator.mediaDevices.getUserMedia()` for camera/mic access
- MediaRecorder API records video chunks in memory (no streaming to server)
- Only uploads final video Blob to Supabase Storage on completion
- Extracts thumbnail from video frame using Canvas API
- Real-time controls for video/audio toggle

### 2. Real-time Analysis (Client-side)
- **face-api.js**: Detects emotions (neutral, happy, sad, angry, surprised, fearful) with confidence scores
- **Web Speech API**: Provides live transcription during interview
- All metrics tracked locally, sent to database only at interview end
- Minimal server load - heavy processing in browser

### 3. AI-Powered Feedback
- Google Gemini API generates personalized interview questions
- Post-interview analysis provides:
  - Overall performance score (0-100)
  - Strengths and areas for improvement
  - Detailed feedback on communication, confidence, and content
  - Emotion pattern analysis

### 4. Interview Playback & Review
- Video player with synchronized transcript
- Emotion timeline visualization
- Question-by-question breakdown
- Downloadable video and analysis reports

### 5. Analytics Dashboard
- Performance tracking over time
- Average score, best performance, improvement rate
- Total practice time and session count
- Visual charts showing score progression

## User Preferences
- Default theme: Dark mode (professional charcoal/purple scheme)
- Font: Inter for UI, JetBrains Mono for code/timestamps
- Video quality: 1080p recording enabled by default
- Real-time features: Live transcription and emotion detection enabled

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── dashboard.tsx          # Main dashboard with stats and recent interviews
│   │   │   ├── interviews.tsx         # Interview list with search
│   │   │   ├── interview-room.tsx     # Recording interface with real-time metrics
│   │   │   ├── interview-playback.tsx # Video playback with analysis
│   │   │   ├── analytics.tsx          # Performance analytics
│   │   │   └── settings.tsx           # User preferences
│   │   ├── components/
│   │   │   ├── app-sidebar.tsx        # Navigation sidebar
│   │   │   ├── theme-toggle.tsx       # Dark/light mode toggle
│   │   │   └── ui/                    # Shadcn UI components
│   │   ├── lib/
│   │   │   ├── theme-provider.tsx     # Theme context
│   │   │   └── queryClient.ts         # TanStack Query setup
│   │   └── App.tsx                    # Main app with routing
├── server/
│   ├── routes.ts                      # API endpoints
│   ├── storage.ts                     # Data storage interface
│   └── gemini.ts                      # Gemini AI integration (to be added)
├── shared/
│   └── schema.ts                      # Shared TypeScript types and Drizzle schemas
└── design_guidelines.md               # Comprehensive UI/UX design system
```

## Environment Variables

**Required (Already Configured):**
- `DATABASE_URL` - Supabase PostgreSQL connection string for backend database
- `GEMINI_API_KEY` - Google Gemini API key for AI question generation and analysis

**Optional (For Video Storage):**
- `VITE_SUPABASE_URL` - Your Supabase project URL (e.g., `https://your-project.supabase.co`)
- `VITE_SUPABASE_KEY` - Your Supabase anon/public API key (safe to expose in browser)

**How to get Supabase Storage credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings** → **API**
4. Copy the **Project URL** → set as `VITE_SUPABASE_URL`
5. Copy the **anon public** key → set as `VITE_SUPABASE_KEY`
6. Go to **Storage** → Create a bucket named `videos` → Make it public

**Note:** Without Supabase Storage configured, interviews will work but videos won't be persisted. The app will still record, transcribe, detect emotions, and provide AI analysis - just without video playback.

**Storage Limits:**
- Supabase Storage supports files up to 5GB per file via the API
- For very long interviews (>30 minutes), consider implementing resumable uploads
- Current implementation uses standard upload (works well for typical 5-15 minute interviews)

## Storage Architecture
- **Videos**: Uploaded **directly from browser** to Supabase Storage in `.webm` format (no server intermediary!)
- **Thumbnails**: Generated client-side using Canvas API, uploaded directly to Supabase Storage as JPEG
- **Metadata**: All interview data, transcripts, emotions stored in PostgreSQL
- **Client-side Processing**: 
  - Video chunks kept in memory during recording
  - Final video Blob uploaded directly to Supabase Storage from browser
  - Only video URLs sent to server (not the video files themselves)
  - This eliminates all server upload size limits and reduces server load to zero for video storage

## Next Steps (Backend Implementation - Task 2)
1. Set up PostgreSQL database with Drizzle migrations
2. Create Supabase Storage buckets for videos and thumbnails
3. Implement API endpoints for:
   - Creating/fetching interviews
   - Uploading videos and thumbnails to Supabase Storage
   - Saving transcripts and emotions
   - Generating AI questions with Gemini
   - Analyzing interview performance
4. Add video upload handling with progress tracking
5. Implement Gemini integration for question generation and feedback

## Development Notes
- Browser-based video processing significantly reduces server costs
- All AI analysis happens post-interview to avoid real-time API costs
- Face-api.js models loaded from CDN for emotion detection
- Web Speech API provides free, browser-native transcription
- Design follows professional video platform aesthetics (Loom/Descript inspired)
