import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Video, Clock, Calendar, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import type { Interview } from "@shared/schema";
import { format } from "date-fns";

export default function Interviews() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: interviews, isLoading } = useQuery<Interview[]>({
    queryKey: ["/api/interviews"],
  });

  const filteredInterviews = interviews?.filter((interview) =>
    interview.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">My Interviews</h1>
          <p className="text-muted-foreground mt-2">
            Review your past interviews and track your progress
          </p>
        </div>
        <Link href="/interview/new">
          <Button size="lg" className="gap-2" data-testid="button-new-interview">
            <Plus className="h-5 w-5" />
            New Interview
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search interviews..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>

      {/* Interview Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-40 w-full rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredInterviews.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <Video className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No matching interviews" : "No interviews yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Start your first mock interview to get personalized feedback"}
              </p>
              {!searchQuery && (
                <Link href="/interview/new">
                  <Button data-testid="button-start-first">
                    <Plus className="h-4 w-4 mr-2" />
                    Start Your First Interview
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInterviews.map((interview) => (
            <Link key={interview.id} href={`/interview/${interview.id}`}>
              <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-interview-${interview.id}`}>
                <CardHeader className="p-0">
                  {interview.thumbnailUrl ? (
                    <img
                      src={interview.thumbnailUrl}
                      alt={interview.title}
                      className="w-full h-40 object-cover rounded-t-lg"
                      data-testid={`img-thumbnail-${interview.id}`}
                    />
                  ) : (
                    <div className="w-full h-40 bg-muted rounded-t-lg flex items-center justify-center">
                      <Video className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  {interview.overallScore !== null && (
                    <div className="absolute top-4 right-4">
                      <Badge 
                        variant={interview.overallScore >= 70 ? "default" : "secondary"}
                        className="font-semibold"
                        data-testid={`badge-score-${interview.id}`}
                      >
                        {interview.overallScore}%
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <CardTitle className="text-lg line-clamp-2" data-testid={`text-title-${interview.id}`}>
                    {interview.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{Math.floor(interview.duration / 60)}:{String(interview.duration % 60).padStart(2, "0")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(interview.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {interview.status === "completed" ? "Completed" : "In Progress"}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
