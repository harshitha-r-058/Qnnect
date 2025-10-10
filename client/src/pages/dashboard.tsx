import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Video, Clock, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Interview } from "@shared/schema";

export default function Dashboard() {
  const { data: interviews, isLoading } = useQuery<Interview[]>({
    queryKey: ["/api/interviews"],
  });

  const recentInterviews = interviews?.slice(0, 3) || [];
  const totalInterviews = interviews?.length || 0;
  const avgScore = totalInterviews > 0 
    ? (interviews?.reduce((acc, i) => acc + (i.overallScore || 0), 0) || 0) / totalInterviews 
    : 0;
  const totalDuration = interviews?.reduce((acc, i) => acc + i.duration, 0) || 0;

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground mt-2">
            Ready to practice your interview skills?
          </p>
        </div>
        <Link href="/interview/new">
          <Button size="lg" className="gap-2" data-testid="button-start-interview">
            <Plus className="h-5 w-5" />
            Start Interview
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold" data-testid="stat-total-interviews">{totalInterviews}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Practice sessions completed
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold" data-testid="stat-avg-score">
                  {avgScore.toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {avgScore >= 70 ? "Great progress!" : "Keep practicing!"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold" data-testid="stat-practice-time">
                  {Math.floor(totalDuration / 60)}m
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total interview time
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Interviews */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recent Interviews</h2>
          <Link href="/interviews">
            <Button variant="ghost" size="sm" data-testid="link-view-all">
              View all
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-32 w-full rounded-lg" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentInterviews.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center gap-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <Video className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No interviews yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start your first mock interview to get personalized feedback
                </p>
                <Link href="/interview/new">
                  <Button data-testid="button-first-interview">
                    <Plus className="h-4 w-4 mr-2" />
                    Start Your First Interview
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentInterviews.map((interview) => (
              <Link key={interview.id} href={`/interview/${interview.id}`}>
                <Card className="hover-elevate cursor-pointer" data-testid={`card-interview-${interview.id}`}>
                  <CardHeader className="p-0">
                    {interview.thumbnailUrl ? (
                      <img
                        src={interview.thumbnailUrl}
                        alt={interview.title}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-muted rounded-t-lg flex items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-base mb-2 line-clamp-1">
                      {interview.title}
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-xs">
                        {Math.floor(interview.duration / 60)}:{String(interview.duration % 60).padStart(2, "0")}
                      </CardDescription>
                      {interview.overallScore !== null && (
                        <Badge variant={interview.overallScore >= 70 ? "default" : "secondary"}>
                          {interview.overallScore}%
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Tips Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Pro Tip</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Maintain eye contact with the camera and speak clearly. Our AI analyzes your emotions
            and speech patterns to give you detailed feedback on your performance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
