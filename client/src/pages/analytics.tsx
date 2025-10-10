import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Award, Clock, Target, Smile, Zap } from "lucide-react";
import type { Interview } from "@shared/schema";

export default function Analytics() {
  const { data: interviews, isLoading } = useQuery<Interview[]>({
    queryKey: ["/api/interviews"],
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalInterviews = interviews?.length || 0;
  const avgScore = totalInterviews > 0
    ? (interviews?.reduce((acc, i) => acc + (i.overallScore || 0), 0) || 0) / totalInterviews
    : 0;
  const totalTime = interviews?.reduce((acc, i) => acc + i.duration, 0) || 0;
  const bestScore = interviews && interviews.length > 0 
    ? Math.max(...interviews.map((i) => i.overallScore || 0)) 
    : 0;
  const improvementRate = interviews && interviews.length >= 2 
    ? ((interviews[interviews.length - 1].overallScore || 0) - (interviews[0].overallScore || 0)) 
    : 0;

  const stats = [
    {
      title: "Total Interviews",
      value: totalInterviews,
      description: "Practice sessions completed",
      icon: Target,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Average Score",
      value: `${avgScore.toFixed(0)}%`,
      description: avgScore >= 70 ? "Above average" : "Room for improvement",
      icon: Award,
      color: "text-primary",
    },
    {
      title: "Best Performance",
      value: `${bestScore}%`,
      description: "Your highest score",
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Practice Time",
      value: `${Math.floor(totalTime / 60)}m`,
      description: "Total interview duration",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Improvement",
      value: improvementRate >= 0 ? `+${improvementRate}%` : `${improvementRate}%`,
      description: "Since first interview",
      icon: Zap,
      color: improvementRate >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
    },
    {
      title: "Confidence",
      value: avgScore >= 70 ? "High" : "Growing",
      description: "Based on performance trends",
      icon: Smile,
      color: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your progress and improve your interview skills
        </p>
      </div>

      {/* Stats Grid */}
      {totalInterviews === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <Target className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No data yet</h3>
              <p className="text-sm text-muted-foreground">
                Complete your first interview to see your analytics
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, "-")}`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progress Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>
                Your interview scores across all sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-2">
                {interviews?.map((interview, i) => (
                  <div
                    key={interview.id}
                    className="flex-1 bg-primary/20 hover:bg-primary/30 rounded-t transition-colors cursor-pointer"
                    style={{ height: `${interview.overallScore}%` }}
                    title={`${interview.title}: ${interview.overallScore}%`}
                    data-testid={`chart-bar-${i}`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span>First Interview</span>
                <span>Latest Interview</span>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {avgScore >= 80 && (
                <p className="text-sm">
                  🎉 Excellent work! You're consistently performing above 80%. You're ready for real interviews!
                </p>
              )}
              {avgScore >= 60 && avgScore < 80 && (
                <p className="text-sm">
                  👍 Good progress! Keep practicing to reach the 80% mark. Focus on areas where you received improvement suggestions.
                </p>
              )}
              {avgScore < 60 && totalInterviews > 0 && (
                <p className="text-sm">
                  💪 You're building your skills! Review the feedback from your interviews and practice regularly to see improvement.
                </p>
              )}
              {totalInterviews >= 5 && (
                <p className="text-sm mt-2">
                  ⭐ You've completed {totalInterviews} interviews! That's dedication. Consider varying your interview types for well-rounded practice.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
