# Qnnect - Deployment & Configuration Notes

## Current MVP Status

This is a fully functional MVP demonstrating browser-based mock interview platform with AI analysis. The core features work without any additional configuration beyond DATABASE_URL and GEMINI_API_KEY.

## What Works Out of the Box

✅ **Without Supabase Storage configured:**
- Interview recording (MediaRecorder API in browser)
- Real-time emotion detection (face-api.js)
- Live speech transcription (Web Speech API)
- AI question generation (Gemini API)
- AI interview analysis and feedback (Gemini API)
- Complete interview workflow and analytics
- Professional UI with dark mode

❌ **Requires Supabase Storage configuration:**
- Video playback (video files stored in Supabase Storage)
- Thumbnail generation and display

## Production Deployment Considerations

### For Video Storage

If you want to enable video storage and playback:

1. **Set up Supabase Storage:**
   - Create a bucket named `videos` in your Supabase project
   - Make the bucket public (for public URLs)
   - Get your project URL and anon key from Supabase Dashboard → Settings → API

2. **Add environment variables:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_KEY=your-anon-public-key
   ```

3. **Storage Limits:**
   - Supabase Storage standard upload: 5GB per file
   - For interviews longer than 30 minutes, consider implementing resumable uploads
   - Current implementation works well for typical 5-15 minute interviews

### Scaling for Large Files (Optional Enhancement)

For production deployments expecting very long interviews (>30 minutes), consider:

1. **Supabase Resumable Upload:**
   - Use Supabase's TUS (resumable) upload protocol
   - Handles network interruptions
   - Better for files >100MB

2. **Chunked Upload:**
   - Split video into chunks during recording
   - Upload chunks in parallel
   - Reassemble on server

3. **Alternative: Pre-signed URLs:**
   - Backend generates pre-signed upload URLs
   - Frontend uploads directly to storage
   - Better control over upload policies

## Architecture Decisions

### Why Client-Side Upload?

1. **Zero Server Load:** Videos never touch the Express server
2. **Scalability:** Each user uploads directly to object storage
3. **Cost:** No bandwidth costs on application server
4. **Performance:** Parallel uploads, no bottleneck

### Why Optional Video Storage?

1. **MVP Focus:** Core value is AI analysis, not video archival
2. **Flexibility:** Users can experience the platform without storage setup
3. **Privacy:** Some users may prefer not storing videos
4. **Cost:** Storage is optional cost

## Testing the MVP

### Without Supabase Storage (Quick Demo):
1. Ensure DATABASE_URL and GEMINI_API_KEY are set
2. Start the application
3. Click "Start Interview"
4. Record a mock interview
5. Get AI analysis and feedback
6. View analytics dashboard

### With Supabase Storage (Full Experience):
1. Follow all steps above plus:
2. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY
3. Create `videos` bucket in Supabase
4. Videos will be stored and available for playback

## Known Limitations

1. **Video Storage is Optional:** The MVP prioritizes AI analysis over video archival
2. **Browser Compatibility:** Requires modern browsers with MediaRecorder, Web Speech API support
3. **Face API Models:** Loaded from CDN (requires internet connection)
4. **Large Files:** Standard upload works for typical interviews; very long recordings may need resumable uploads

## Future Enhancements

1. Implement resumable uploads for very long interviews
2. Add video compression options
3. Implement background upload with retry logic
4. Add video trimming/editing capabilities
5. Support custom interview templates
6. Add team collaboration features
