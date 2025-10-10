import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Circle, 
  Square, 
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { VideoRecorder, captureVideoThumbnail } from "@/lib/media-recorder";
import { uploadVideoToSupabase, uploadThumbnailToSupabase } from "@/lib/supabase-client";
import { SpeechRecognition, type TranscriptEntry } from "@/lib/speech-recognition";
import { EmotionDetector, type EmotionData } from "@/lib/emotion-detection";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function InterviewRoom() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRecorder = useRef<VideoRecorder>(new VideoRecorder());
  const speechRecognition = useRef<SpeechRecognition>(new SpeechRecognition());
  const emotionDetector = useRef<EmotionDetector>(new EmotionDetector());
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [questions, setQuestions] = useState<Array<{ questionText: string; category: string }>>([]);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [emotions, setEmotions] = useState<EmotionData[]>([]);
  const [currentInterviewId, setCurrentInterviewId] = useState<string>("");

  // Initialize interview and generate questions
  useEffect(() => {
    const initializeInterview = async () => {
      try {
        // Generate questions
        const generatedQuestions = await apiRequest<Array<{ questionText: string; category: string }>>(
          'POST',
          '/api/questions/generate',
          { jobTitle: 'software engineer', count: 4 }
        );
        setQuestions(generatedQuestions);

        // Create interview record
        const interview = await apiRequest<{ id: string }>(
          'POST',
          '/api/interviews',
          {
            title: `Interview - ${new Date().toLocaleDateString()}`,
            duration: 0,
            status: 'in_progress',
          }
        );
        setCurrentInterviewId(interview.id);

        // Save questions to database
        await apiRequest(
          'POST',
          `/api/interviews/${interview.id}/questions`,
          {
            questions: generatedQuestions.map((q) => ({
              questionText: q.questionText,
              aiGenerated: true,
            })),
          }
        );
      } catch (error) {
        console.error('Error initializing interview:', error);
        toast({
          title: "Error",
          description: "Failed to initialize interview. Using default questions.",
          variant: "destructive",
        });
        // Use fallback questions
        setQuestions([
          { questionText: "Tell me about yourself and your background.", category: "introduction" },
          { questionText: "What are your greatest strengths?", category: "behavioral" },
          { questionText: "Describe a challenging situation you faced.", category: "behavioral" },
          { questionText: "Where do you see yourself in five years?", category: "career" },
        ]);
      }
    };

    initializeInterview();
  }, []);

  // Initialize camera and microphone
  useEffect(() => {
    const initMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Initialize video recorder
        await videoRecorder.current.initialize(mediaStream);

        // Initialize speech recognition
        const speechInitialized = speechRecognition.current.initialize((entry) => {
          setTranscripts((prev) => {
            // Update or add transcript
            if (entry.isFinal) {
              return [...prev, entry];
            } else {
              // Replace last interim result
              const withoutLast = prev.slice(0, -1);
              return [...withoutLast, entry];
            }
          });
        });

        if (!speechInitialized) {
          console.warn('Speech recognition not available');
        }

        // Initialize emotion detection
        if (videoRef.current) {
          const emotionInitialized = await emotionDetector.current.initialize(
            videoRef.current,
            (data) => {
              setEmotions((prev) => [...prev, data]);
            }
          );

          if (!emotionInitialized) {
            console.warn('Emotion detection not available');
          }
        }

        setIsPreparing(false);
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setError("Unable to access camera or microphone. Please check permissions.");
        setIsPreparing(false);
      }
    };

    initMedia();

    return () => {
      videoRecorder.current.cleanup();
      speechRecognition.current.cleanup();
      emotionDetector.current.cleanup();
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

  const startRecording = () => {
    try {
      videoRecorder.current.start();
      speechRecognition.current.start();
      emotionDetector.current.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Good luck with your interview!",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start recording",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Stop all recording
      const videoBlob = await videoRecorder.current.stop();
      speechRecognition.current.stop();
      emotionDetector.current.stop();

      // Update progress
      setUploadProgress(10);

      // Generate thumbnail
      let thumbnailBlob: Blob | null = null;
      if (videoRef.current) {
        thumbnailBlob = await captureVideoThumbnail(videoRef.current);
      }
      setUploadProgress(20);

      // Upload video directly to Supabase Storage (client-side)
      // Note: This returns null if Supabase Storage is not configured or upload fails
      let videoUrl: string | null = null;
      try {
        videoUrl = await uploadVideoToSupabase(currentInterviewId, videoBlob);
        if (!videoUrl) {
          console.warn('Video upload returned null - Supabase Storage may not be configured');
          toast({
            title: "Video Not Stored",
            description: "Your interview analysis will be saved, but the video recording won't be available for playback. Configure Supabase Storage to enable video storage.",
          });
        }
      } catch (error) {
        console.error('Video upload error:', error);
        toast({
          title: "Video Upload Failed",
          description: "Continuing with interview analysis. Video not available for playback.",
        });
      }
      setUploadProgress(40);

      // Upload thumbnail
      let thumbnailUrl: string | null = null;
      if (thumbnailBlob) {
        thumbnailUrl = await uploadThumbnailToSupabase(currentInterviewId, thumbnailBlob);
      }
      setUploadProgress(50);

      // Update interview with video URLs
      await apiRequest(
        'PUT',
        `/api/interviews/${currentInterviewId}`,
        { 
          videoUrl: videoUrl || undefined, 
          thumbnailUrl: thumbnailUrl || undefined,
          status: 'completed'
        }
      );

      // Save transcripts
      const finalTranscripts = transcripts.filter((t) => t.isFinal);
      if (finalTranscripts.length > 0) {
        await apiRequest(
          'POST',
          `/api/interviews/${currentInterviewId}/transcripts`,
          {
            transcripts: finalTranscripts.map((t) => ({
              text: t.text,
              timestamp: t.timestamp,
              speaker: 'user',
            })),
          }
        );
      }
      setUploadProgress(70);

      // Save emotions
      if (emotions.length > 0) {
        await apiRequest(
          'POST',
          `/api/interviews/${currentInterviewId}/emotions`,
          { emotions }
        );
      }
      setUploadProgress(80);

      // Update interview duration
      await apiRequest(
        'PUT',
        `/api/interviews/${currentInterviewId}`,
        { duration }
      );
      setUploadProgress(90);

      // Analyze interview
      await apiRequest(
        'POST',
        `/api/interviews/${currentInterviewId}/analyze`,
        {}
      );
      setUploadProgress(100);

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['/api/interviews'] });

      toast({
        title: "Interview Complete!",
        description: "Your interview has been analyzed successfully.",
      });

      // Navigate to interview details
      setTimeout(() => {
        navigate(`/interview/${currentInterviewId}`);
      }, 1000);
    } catch (error) {
      console.error('Error processing interview:', error);
      toast({
        title: "Error",
        description: "Failed to process interview. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  // Get current emotion display
  const latestEmotion = emotions[emotions.length - 1];
  const latestTranscript = transcripts.filter((t) => t.isFinal).slice(-3);

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center h-screen p-8">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing Interview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Uploading your video and analyzing your performance...
            </p>
            <Progress value={uploadProgress} data-testid="progress-upload" />
            <p className="text-xs text-muted-foreground text-center">
              {uploadProgress}% complete
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Video Preview */}
      <div className="flex-1 relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          data-testid="video-preview"
        />

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive/90 backdrop-blur-sm px-3 py-2 rounded-lg">
            <Circle className="h-3 w-3 fill-white animate-pulse" />
            <span className="text-sm font-mono text-white">{formatTime(duration)}</span>
          </div>
        )}

        {/* Question Card */}
        {questions.length > 0 && (
          <div className="absolute top-4 right-4 left-4 md:left-auto md:w-96">
            <Card className="backdrop-blur-xl bg-card/90 border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    Question {currentQuestion + 1} of {questions.length}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatTime(duration)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-medium leading-relaxed">
                  {questions[currentQuestion]?.questionText}
                </p>
                {isRecording && currentQuestion < questions.length - 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextQuestion}
                    className="w-full gap-2"
                    data-testid="button-next-question"
                  >
                    Next Question
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Real-time Metrics */}
        {isRecording && (
          <div className="absolute bottom-24 left-4 right-4 md:left-4 md:right-auto md:w-80">
            <Card className="backdrop-blur-xl bg-card/90 border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Real-time Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {/* Emotion Display */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Emotion:</span>
                  {latestEmotion ? (
                    <Badge variant="secondary" className="capitalize">
                      {latestEmotion.emotion} ({(latestEmotion.confidence * 100).toFixed(0)}%)
                    </Badge>
                  ) : (
                    <Badge variant="outline">Detecting...</Badge>
                  )}
                </div>
                
                {/* Transcript Preview */}
                <div className="space-y-1">
                  <span className="text-muted-foreground">Live Transcript:</span>
                  <ScrollArea className="h-20 rounded-md bg-muted/50 p-2">
                    {latestTranscript.length > 0 ? (
                      <div className="space-y-1 text-xs">
                        {latestTranscript.map((t, i) => (
                          <p key={i} className="leading-relaxed">{t.text}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Listening...</p>
                    )}
                  </ScrollArea>
                </div>

                <p className="text-muted-foreground pt-1">
                  {emotions.length} emotion samples • {transcripts.filter((t) => t.isFinal).length} transcript entries
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-4 bg-card/90 backdrop-blur-xl rounded-full px-6 py-4 shadow-lg border-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVideo}
              disabled={isPreparing}
              data-testid="button-toggle-video"
              className="h-12 w-12 rounded-full"
            >
              {videoEnabled ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAudio}
              disabled={isPreparing}
              data-testid="button-toggle-audio"
              className="h-12 w-12 rounded-full"
            >
              {audioEnabled ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>

            {!isRecording ? (
              <Button
                size="lg"
                onClick={startRecording}
                disabled={isPreparing || !!error || questions.length === 0}
                className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90"
                data-testid="button-start-recording"
              >
                <Circle className="h-8 w-8 fill-white" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={stopRecording}
                variant="secondary"
                className="h-16 w-16 rounded-full"
                data-testid="button-stop-recording"
              >
                <Square className="h-6 w-6 fill-current" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
