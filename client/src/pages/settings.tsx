import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Video, Mic, Bell, User, Shield, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <div className="flex flex-col gap-6 p-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and application settings
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how Qnnect looks for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark mode
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Video Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Settings
          </CardTitle>
          <CardDescription>
            Configure your video recording preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hd-recording">HD Recording</Label>
              <p className="text-sm text-muted-foreground">
                Record videos in 1080p (higher quality, larger file size)
              </p>
            </div>
            <Switch id="hd-recording" defaultChecked data-testid="switch-hd-recording" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-save">Auto-save Videos</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save video locally as backup
              </p>
            </div>
            <Switch id="auto-save" data-testid="switch-auto-save" />
          </div>
        </CardContent>
      </Card>

      {/* Audio Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Audio Settings
          </CardTitle>
          <CardDescription>
            Manage your microphone and audio preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="noise-cancellation">Noise Cancellation</Label>
              <p className="text-sm text-muted-foreground">
                Reduce background noise during recording
              </p>
            </div>
            <Switch id="noise-cancellation" defaultChecked data-testid="switch-noise-cancellation" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="live-transcription">Live Transcription</Label>
              <p className="text-sm text-muted-foreground">
                Show real-time transcript during interview
              </p>
            </div>
            <Switch id="live-transcription" defaultChecked data-testid="switch-live-transcription" />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose what notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analysis-ready">Analysis Complete</Label>
              <p className="text-sm text-muted-foreground">
                Notify when AI analysis is ready
              </p>
            </div>
            <Switch id="analysis-ready" defaultChecked data-testid="switch-analysis-ready" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="tips">Practice Tips</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly tips to improve your skills
              </p>
            </div>
            <Switch id="tips" data-testid="switch-tips" />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data
          </CardTitle>
          <CardDescription>
            Manage your data and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics">Usage Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Help improve Qnnect by sharing anonymous usage data
              </p>
            </div>
            <Switch id="analytics" defaultChecked data-testid="switch-analytics" />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Data Management</Label>
            <p className="text-sm text-muted-foreground">
              Export or delete your interview data
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" data-testid="button-export">
                Export Data
              </Button>
              <Button variant="outline" size="sm" data-testid="button-delete">
                Delete All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account
          </CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Account Status</Label>
            <p className="text-sm text-muted-foreground">
              Free tier - Unlimited practice interviews
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Danger Zone</Label>
            <Button variant="destructive" size="sm" data-testid="button-delete-account">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
