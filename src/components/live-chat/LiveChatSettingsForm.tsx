import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Clock, MessageSquare, Save } from "lucide-react";
import { useLiveChatSettings, useUpdateLiveChatSettings, LiveChatSettings } from "@/hooks/useLiveChatSettings";

const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

export function LiveChatSettingsForm() {
  const { data: settings, isLoading } = useLiveChatSettings();
  const updateSettings = useUpdateLiveChatSettings();
  
  const [formData, setFormData] = useState<Partial<LiveChatSettings>>({});

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(formData);
  };

  const updateField = <K extends keyof LiveChatSettings>(key: K, value: LiveChatSettings[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDay = (day: number) => {
    const currentDays = formData.business_days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort((a, b) => a - b);
    updateField("business_days", newDays);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Enable or disable live chat for your users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_enabled">Live Chat Enabled</Label>
              <p className="text-sm text-muted-foreground">When disabled, users cannot start new chats</p>
            </div>
            <Switch
              id="is_enabled"
              checked={formData.is_enabled ?? true}
              onCheckedChange={(checked) => updateField("is_enabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Business Hours
          </CardTitle>
          <CardDescription>Set when your support team is available</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business_hours_start">Start Time</Label>
              <Input
                id="business_hours_start"
                type="time"
                value={formData.business_hours_start?.slice(0, 5) || "09:00"}
                onChange={(e) => updateField("business_hours_start", e.target.value + ":00")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_hours_end">End Time</Label>
              <Input
                id="business_hours_end"
                type="time"
                value={formData.business_hours_end?.slice(0, 5) || "17:00"}
                onChange={(e) => updateField("business_hours_end", e.target.value + ":00")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Business Days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={formData.business_days?.includes(day.value) ?? false}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  <Label htmlFor={`day-${day.value}`} className="text-sm font-normal cursor-pointer">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: if you leave all days unchecked, chat will be considered available every day (no day restriction).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="offline_message">Offline Message</Label>
            <Textarea
              id="offline_message"
              placeholder="Message shown when outside business hours..."
              value={formData.offline_message || ""}
              onChange={(e) => updateField("offline_message", e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This message is shown to users when they try to start a chat outside business hours
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Auto Reply */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Auto Reply
          </CardTitle>
          <CardDescription>Configure automatic responses when admins are busy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto_reply_enabled">Enable Auto Reply</Label>
              <p className="text-sm text-muted-foreground">Send automatic message after waiting period</p>
            </div>
            <Switch
              id="auto_reply_enabled"
              checked={formData.auto_reply_enabled ?? true}
              onCheckedChange={(checked) => updateField("auto_reply_enabled", checked)}
            />
          </div>

          {formData.auto_reply_enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="auto_reply_delay">Delay (seconds)</Label>
                <Input
                  id="auto_reply_delay"
                  type="number"
                  min={30}
                  max={600}
                  value={formData.auto_reply_delay_seconds || 120}
                  onChange={(e) => updateField("auto_reply_delay_seconds", parseInt(e.target.value) || 120)}
                />
                <p className="text-xs text-muted-foreground">
                  How long to wait before sending the auto-reply (30-600 seconds)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auto_reply_message">Auto Reply Message</Label>
                <Textarea
                  id="auto_reply_message"
                  placeholder="Message sent after waiting period..."
                  value={formData.auto_reply_message || ""}
                  onChange={(e) => updateField("auto_reply_message", e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={updateSettings.isPending} className="w-full sm:w-auto">
        <Save className="h-4 w-4 mr-2" />
        {updateSettings.isPending ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
