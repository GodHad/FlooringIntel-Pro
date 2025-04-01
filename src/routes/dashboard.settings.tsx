import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyRound } from "lucide-react";
import { authService, notificationService, type NotificationPreferences } from "@/services/api";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings - FlooringIntel" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["current-user"], queryFn: authService.getCurrentUser });
  const { data: notificationPreferences } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: notificationService.getNotificationPreferences,
  });
  const [preferences, setPreferences] = useState<Partial<NotificationPreferences>>({});
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved");
  };

  useEffect(() => {
    if (notificationPreferences) setPreferences(notificationPreferences);
  }, [notificationPreferences]);

  const setPreference = (field: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences((current) => ({ ...current, [field]: value }));
  };

  const saveNotificationPreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await notificationService.updateNotificationPreferences(preferences);
    setPreferences(saved);
    await queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    toast.success("Notification preferences saved");
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account, company, and notifications" />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <h3 className="font-display text-lg font-semibold">Profile</h3>
            <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={save}>
              <div className="space-y-2"><Label>Name</Label><Input value={user?.name ?? ""} readOnly /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={user?.email ?? ""} readOnly /></div>
              <div className="space-y-2 md:col-span-2"><Label>Change password</Label><Input type="password" placeholder="New password" /></div>
              <div className="md:col-span-2"><Button type="submit">Save changes</Button></div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card className="p-6">
            <h3 className="font-display text-lg font-semibold">Company</h3>
            <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={save}>
              <div className="space-y-2"><Label>Company name</Label><Input value={user?.company ?? ""} readOnly /></div>
              <div className="space-y-2"><Label>Role</Label><Input defaultValue="Procurement Lead" /></div>
              <div className="space-y-2 md:col-span-2">
                <Label>Timezone</Label>
                <Select defaultValue="utc-5">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="utc+1">Central European (UTC+1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2"><Button type="submit">Save changes</Button></div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <h3 className="font-display text-lg font-semibold">Notifications</h3>
            <form className="mt-5 space-y-4" onSubmit={saveNotificationPreferences}>
              <div className="space-y-2">
                <Label>Daily summary time</Label>
                <Select
                  value={preferences.dailySummaryTime ?? "08:00"}
                  onValueChange={(value) => setPreference("dailySummaryTime", value)}
                >
                  <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">6:00 AM</SelectItem>
                    <SelectItem value="08:00">8:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="17:00">5:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <NotificationPreferenceRow
                title="Invoice status updates"
                inApp={preferences.inAppInvoiceUpdates ?? true}
                email={preferences.emailInvoiceUpdates ?? true}
                onInApp={(value) => setPreference("inAppInvoiceUpdates", value)}
                onEmail={(value) => setPreference("emailInvoiceUpdates", value)}
              />
              <NotificationPreferenceRow
                title="Ticket status updates"
                inApp={preferences.inAppTicketUpdates ?? true}
                email={preferences.emailTicketUpdates ?? true}
                onInApp={(value) => setPreference("inAppTicketUpdates", value)}
                onEmail={(value) => setPreference("emailTicketUpdates", value)}
              />
              <NotificationPreferenceRow
                title="Daily new product summary"
                inApp={preferences.inAppDailyNewProducts ?? true}
                email={preferences.emailDailyNewProducts ?? true}
                onInApp={(value) => setPreference("inAppDailyNewProducts", value)}
                onEmail={(value) => setPreference("emailDailyNewProducts", value)}
              />
              <NotificationPreferenceRow
                title="Scraping status updates"
                inApp={preferences.inAppScrapingUpdates ?? true}
                email={preferences.emailScrapingUpdates ?? true}
                onInApp={(value) => setPreference("inAppScrapingUpdates", value)}
                onEmail={(value) => setPreference("emailScrapingUpdates", value)}
              />
              <Button type="submit">Save changes</Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card className="p-6">
            <h3 className="font-display text-lg font-semibold">API access</h3>
            <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center">
              <KeyRound className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-medium">API keys are not enabled yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Backend API integration will be connected later.
              </p>
              <Button variant="outline" disabled className="mt-4">Generate API key</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationPreferenceRow({
  title,
  inApp,
  email,
  onInApp,
  onEmail,
}: {
  title: string;
  inApp: boolean;
  email: boolean;
  onInApp: (value: boolean) => void;
  onEmail: (value: boolean) => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-3 text-sm md:grid-cols-[1fr_auto_auto] md:items-center">
      <span className="font-medium">{title}</span>
      <label className="flex items-center justify-between gap-3 md:justify-start">
        <span className="text-muted-foreground">In-app</span>
        <Switch checked={inApp} onCheckedChange={onInApp} />
      </label>
      <label className="flex items-center justify-between gap-3 md:justify-start">
        <span className="text-muted-foreground">Email</span>
        <Switch checked={email} onCheckedChange={onEmail} />
      </label>
    </div>
  );
}
