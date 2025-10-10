import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play, Pause, Volume2, Maximize, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useState, useRef } from "react";
import type { InterviewWithDetails } from "@shared/schema";
import { format } from "date-fns";

export default function InterviewPlayback() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const { data: interview, isLoading } = useQuery<InterviewWithDetails>({
    queryKey: ["/api/interviews", id],
  });

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <Skeleton className="h-screen w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Interview Not Found</CardTitle>
            <CardDescription>
              The interview you're looking for doesn't exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/interviews")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-interview-title">{interview.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(interview.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {interview.overallScore !== null && (
            <Badge variant={interview.overallScore >= 70 ? "default" : "secondary"} className="text-base px-4 py-1">
              Score: {interview.overallScore}%
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <Card>
            <CardContent className="p-0">
              {interview.videoUrl ? (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={interview.videoUrl}
                    className="w-full h-full"
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    data-testid="video-playback"
                  />
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePlay}
                        className="text-white hover:text-white"
                        data-testid="button-play-pause"
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      <div className="flex-1">
                        <Progress value={(currentTime / interview.duration) * 100} className="h-1" />
                      </div>
                      <span className="text-white text-sm font-mono">
                        {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")} / {Math.floor(interview.duration / 60)}:{String(interview.duration % 60).padStart(2, "0")}
                      </span>
                      <Button variant="ghost" size="icon" className="text-white hover:text-white">
                        <Volume2 className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-white hover:text-white">
                        <Maximize className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Video processing...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Tabs */}
          <Tabs defaultValue="feedback" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feedback" data-testid="tab-feedback">Feedback</TabsTrigger>
              <TabsTrigger value="transcript" data-testid="tab-transcript">Transcript</TabsTrigger>
              <TabsTrigger value="emotions" data-testid="tab-emotions">Emotions</TabsTrigger>
            </TabsList>

            <TabsContent value="feedback" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {interview.analysis ? (
                    <>
                      <div>
                        <h3 className="font-semibold mb-2">Overall Feedback</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {interview.analysis.feedback}
                        </p>
                      </div>

                      <Separator />

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-3 text-green-600 dark:text-green-400">Strengths</h3>
                          <ul className="space-y-2">
                            {(interview.analysis.strengths as string[]).map((strength, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-green-600 dark:text-green-400">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-3 text-amber-600 dark:text-amber-400">Areas to Improve</h3>
                          <ul className="space-y-2">
                            {(interview.analysis.improvements as string[]).map((improvement, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-amber-600 dark:text-amber-400">•</span>
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Analysis is being processed. Check back in a few moments.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transcript">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Transcript</CardTitle>
                  <CardDescription>
                    Auto-generated from speech recognition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {interview.transcripts && interview.transcripts.length > 0 ? (
                      <div className="space-y-4">
                        {interview.transcripts.map((transcript) => (
                          <div key={transcript.id} className="flex gap-3">
                            <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                              {Math.floor(transcript.timestamp / 60)}:{String(Math.floor(transcript.timestamp % 60)).padStart(2, "0")}
                            </span>
                            <p className="text-sm leading-relaxed">{transcript.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No transcript available yet.
                      </p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emotions">
              <Card>
                <CardHeader>
                  <CardTitle>Emotion Timeline</CardTitle>
                  <CardDescription>
                    Real-time emotion detection throughout your interview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {interview.emotions && interview.emotions.length > 0 ? (
                    <div className="space-y-4">
                      <div className="h-64 flex items-end gap-1">
                        {interview.emotions.slice(0, 50).map((emotion, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-primary/20 rounded-t"
                            style={{ height: `${emotion.confidence * 100}%` }}
                            title={`${emotion.emotion} (${(emotion.confidence * 100).toFixed(0)}%)`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {["neutral", "happy", "confident"].map((emotion) => (
                          <div key={emotion} className="text-center">
                            <div className="text-2xl font-bold">
                              {interview.emotions?.filter((e) => e.emotion === emotion).length || 0}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">{emotion}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No emotion data available yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Questions</CardTitle>
              <CardDescription>
                {interview.questions?.length || 0} questions asked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {interview.questions && interview.questions.length > 0 ? (
                  <div className="space-y-4">
                    {interview.questions.map((question, index) => (
                      <div key={question.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Q{index + 1}
                          </Badge>
                          {question.aiGenerated === 1 && (
                            <Badge variant="secondary" className="text-xs">
                              AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed">
                          {question.questionText}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No questions recorded.
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full gap-2" data-testid="button-download">
                <Download className="h-4 w-4" />
                Download Video
              </Button>
              <Button variant="outline" className="w-full gap-2" data-testid="button-share">
                Share Interview
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
