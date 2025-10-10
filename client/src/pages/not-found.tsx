import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-6xl font-bold text-primary">404</h1>
          </div>
          <CardTitle>Page Not Found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button onClick={() => navigate("/")} className="w-full gap-2" data-testid="button-home">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button variant="ghost" onClick={() => window.history.back()} className="w-full gap-2" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
