import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, StatusBadge } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authService, notificationService, subscriptionService, websiteService } from "@/services/api";
import { Globe2, Plus, Eye, Download } from "lucide-react";

export const Route = createFileRoute("/dashboard/websites")({
  head: () => ({ meta: [{ title: "Websites — FlooringIntel" }] }),
  component: WebsitesPage,
});

function WebsitesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: user } = useQuery({ queryKey: ["current-user"], queryFn: authService.getCurrentUser });
  const { data: notificationPreferences } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: notificationService.getNotificationPreferences,
    enabled: user?.role !== "Admin",
  });
  const [alertOverrides, setAlertOverrides] = useState<Record<string, boolean>>({});
  const [exportingWebsite, setExportingWebsite] = useState<string | null>(null);
  const isAdmin = user?.role === "Admin";
  const isPartner = user?.role === "Partner";
  const { data: websites = [] } = useQuery({
    queryKey: ["websites", { includeDisabled: isAdmin }],
    queryFn: () => websiteService.getWebsites({ includeDisabled: isAdmin }),
  });
  const updateWebsiteMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      websiteService.updateWebsite(id, {
        enabled,
        status: enabled ? "Active" : "Paused",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites"] });
      toast.success("Website status updated");
    },
    onError: (error) => toast.error(error.message),
  });

  const toggleAlert = async (websiteId: string, enabled: boolean) => {
    if (!websites.find((website) => website.id === websiteId)?.subscribed && !isPartner) return;
    
    const nextOverrides = { ...alertOverrides, [websiteId]: enabled };
    setAlertOverrides(nextOverrides);
    const savedWebsiteIds = new Set(notificationPreferences?.websiteIds ?? []);
    const enabledWebsiteIds = websites
    .filter((website) => (website.subscribed || isPartner) && (nextOverrides[website.id] ?? savedWebsiteIds.has(website.id)))
    .map((website) => website.id);
    
    await subscriptionService.updateNotificationPreferences({ websiteIds: enabledWebsiteIds });
    queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    queryClient.invalidateQueries({ queryKey: ["websites"] });
    toast.success("Email alert preferences updated");
  };

  const exportWebsite = async (websiteId: string, websiteName: string) => {
    setExportingWebsite(websiteId);
    try {
      const download = await websiteService.exportWebsiteProducts(websiteId);
      const url = window.URL.createObjectURL(download.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${websiteName.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || websiteId}-products.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success(download.metadata.limited
        ? "Your export includes the available limited product set."
        : "Website export downloaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Website export failed");
    } finally {
      setExportingWebsite(null);
    }
  };

  return (
    <div>
      <PageHeader title="Websites" description="Carpet supplier websites being scraped">
        {isAdmin ? <CreateSiteDialog onCreated={() => queryClient.invalidateQueries({ queryKey: ["websites"] })} /> : <RequestSiteDialog />}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {websites.map((w) => (
          <Card key={w.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary">
                  <Globe2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{w.name}</p>
                  <p className="text-xs text-muted-foreground">{w.domain}</p>
                </div>
              </div>
              <StatusBadge status={w.enabled === false ? "Paused" : w.status} />
            </div>
            {isAdmin && (
              <div className="mt-5 flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Website scraping</p>
                  <p className="text-xs text-muted-foreground">{w.enabled === false ? "Disabled" : "Enabled"}</p>
                </div>
                <Switch
                  checked={w.enabled !== false}
                  disabled={updateWebsiteMutation.isPending}
                  onCheckedChange={(checked) => updateWebsiteMutation.mutate({ id: w.id, enabled: Boolean(checked) })}
                />
              </div>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Products</p>
                <p className="font-medium">{w.productCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Frequency</p>
                <p className="font-medium">{w.frequency}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Last update</p>
                <p className="font-medium">{w.lastScrape ? new Date(w.lastScrape).toLocaleString() : "—"}</p>
              </div>
            </div>
            {!isAdmin && (
              <>
                <div className="mt-5 flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">Email alerts</p>
                    <p className="text-xs text-muted-foreground">
                      {(w.subscribed || isPartner)? "Available during active trial or Pro access" : "Requires an active trial or subscription"}
                    </p>
                  </div>
                  <Switch
                    checked={(w.subscribed || isPartner) && (alertOverrides[w.id] ?? notificationPreferences?.websiteIds.includes(w.id) ?? false)}
                    disabled={!w.subscribed && !isPartner}
                    onCheckedChange={(checked) => toggleAlert(w.id, Boolean(checked))}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate({
                      to: "/dashboard/products",
                      search: { website: w.id },
                    })}
                  >
                    <Eye className="mr-2 h-4 w-4" />View products
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={exportingWebsite === w.id}
                    onClick={() => exportWebsite(w.id, w.name)}
                  >
                    <Download className="mr-2 h-4 w-4" />{exportingWebsite === w.id ? "Exporting..." : "Export"}
                  </Button>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function CreateSiteDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Website</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add website</DialogTitle>
          <DialogDescription>Create a site entry available to users and partners.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            try {
              await websiteService.createWebsite({
                site: form.get("site"),
                name: form.get("name"),
                domain: form.get("domain"),
                frequency: form.get("frequency"),
                status: form.get("status"),
                enabled: true,
              });
              setOpen(false);
              onCreated();
              toast.success("Website added");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to add website");
            }
          }}
        >
          <div className="space-y-2"><Label>Site ID</Label><Input name="site" required placeholder="shawfloors" /></div>
          <div className="space-y-2"><Label>Name</Label><Input name="name" required placeholder="Shaw Floors" /></div>
          <div className="space-y-2"><Label>Domain</Label><Input name="domain" placeholder="shawfloors.com" /></div>
          <div className="space-y-2"><Label>Frequency</Label><Input name="frequency" defaultValue="Daily" /></div>
          <div className="space-y-2"><Label>Status</Label><Input name="status" defaultValue="Active" /></div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Add website</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RequestSiteDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Request New Website</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a new website</DialogTitle>
          <DialogDescription>Tell us which carpet supplier site to add. Our team configures the scraper.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            await websiteService.requestNewWebsite({
              name: form.get("name"),
              websiteUrl: form.get("websiteUrl"),
              message: form.get("message"),
              frequency: form.get("frequency"),
              notes: form.get("notes"),
            });
            setOpen(false);
            toast.success("Your request has been submitted. Our team will review and update the ticket status.");
          }}
        >
          <div className="space-y-2"><Label>Website name</Label><Input name="name" required placeholder="e.g. Beaulieu Carpets" /></div>
          <div className="space-y-2"><Label>Website URL</Label><Input name="websiteUrl" required type="url" placeholder="https://" /></div>
          <div className="space-y-2"><Label>What product data should be scraped?</Label>
            <Textarea name="message" placeholder="e.g. name, price, color, material, availability" />
          </div>
          <div className="space-y-2"><Label>How often should it be scraped?</Label><Input name="frequency" placeholder="Daily / Weekly" /></div>
          <div className="space-y-2"><Label>Notes</Label><Textarea name="notes" placeholder="Anything else we should know" /></div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Submit request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
