import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader, StatusBadge } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { authService, scrapingService, type ScrapingRequestRecord, type ScrapingStatusSite } from "@/services/api";
import { Activity, AlertTriangle, CheckCircle2, Clock, FileText, Play, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/dashboard/scraping-status")({
  head: () => ({ meta: [{ title: "Scraping Status - FlooringIntel" }] }),
  component: ScrapingPage,
});

type LogTarget = {
  type: "site" | "request";
  id: string;
  title: string;
  subtitle: string;
};

const formatDateTime = (value?: string | null) => (
  value ? new Date(value).toLocaleString() : "-"
);

function ScrapingPage() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["current-user"], queryFn: authService.getCurrentUser });
  const [statusFilter, setStatusFilter] = useState("all");
  const [siteFilter, setSiteFilter] = useState("all");
  const [runningSiteId, setRunningSiteId] = useState<string | null>(null);
  const [logTarget, setLogTarget] = useState<LogTarget | null>(null);
  const isAdmin = user?.role === "Admin";

  const { data: sites = [] } = useQuery({
    queryKey: ["scraping-status-sites"],
    queryFn: scrapingService.getScrapingStatusSites,
  });
  const { data: requests = [] } = useQuery({
    queryKey: ["scraping-requests", statusFilter, siteFilter],
    queryFn: () => scrapingService.getScrapingRequests({ status: statusFilter, siteId: siteFilter }),
  });
  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["scraping-target-logs", logTarget?.type, logTarget?.id],
    queryFn: () => (
      logTarget?.type === "site"
        ? scrapingService.getScrapingSiteLogs(logTarget.id)
        : scrapingService.getScrapingRequestLogs(logTarget?.id || "")
    ),
    enabled: Boolean(logTarget),
  });

  const counts = useMemo(() => ({
    running: requests.filter((request) => request.status === "Running").length,
    completed: requests.filter((request) => request.status === "Completed").length,
    failed: requests.filter((request) => request.status === "Failed").length,
    sites: sites.length,
  }), [requests, sites]);

  const cards = [
    { label: "Available sites", value: counts.sites, icon: Activity, tone: "text-primary" },
    { label: "Running requests", value: counts.running, icon: Clock, tone: "text-primary" },
    { label: "Completed requests", value: counts.completed, icon: CheckCircle2, tone: "text-success" },
    { label: "Failed requests", value: counts.failed, icon: AlertTriangle, tone: "text-destructive" },
  ];

  const scrapeNow = async (site: ScrapingStatusSite) => {
    setRunningSiteId(site.id);
    try {
      await scrapingService.createScrapingRequest(site.id);
      toast.success("Scraping request sent.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["scraping-status-sites"] }),
        queryClient.invalidateQueries({ queryKey: ["scraping-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["scraping-jobs"] }),
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send scraping request");
    } finally {
      setRunningSiteId(null);
    }
  };

  const openSiteLogs = (site: ScrapingStatusSite) => {
    setLogTarget({
      type: "site",
      id: site.id,
      title: site.name,
      subtitle: "Recent site logs",
    });
  };

  const openRequestLogs = (request: ScrapingRequestRecord) => {
    setLogTarget({
      type: "request",
      id: request.id,
      title: request.siteName,
      subtitle: request.requestId,
    });
  };

  return (
    <div>
      <PageHeader
        title="Scraping Status"
        description="Monitor available sites, scraper status, and recent scraping requests."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-2 font-display text-3xl font-semibold tracking-tight">{card.value}</p>
                </div>
                <Icon className={`h-6 w-6 ${card.tone}`} />
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h3 className="font-display text-lg font-semibold">Available Sites</h3>
            <p className="text-sm text-muted-foreground">All enabled websites and their latest scraper status.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Site name</th>
                <th className="p-3">Domain</th>
                <th className="p-3">Status</th>
                <th className="hidden p-3 md:table-cell">Last update</th>
                <th className="p-3">Last request</th>
                <th className="hidden p-3 lg:table-cell">Last scraping time</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sites.map((site) => (
                <tr key={site.id} className="hover:bg-muted/30">
                  <td className="p-3 font-medium">{site.name}</td>
                  <td className="p-3 text-muted-foreground">{site.domain}</td>
                  <td className="p-3"><StatusBadge status={site.status} /></td>
                  <td className="hidden p-3 text-muted-foreground md:table-cell">{formatDateTime(site.lastUpdate)}</td>
                  <td className="p-3">{site.lastRequestStatus ? <StatusBadge status={site.lastRequestStatus} /> : <span className="text-muted-foreground">-</span>}</td>
                  <td className="hidden p-3 text-muted-foreground lg:table-cell">{formatDateTime(site.lastScrapeAt)}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => openSiteLogs(site)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button size="sm" onClick={() => scrapeNow(site)} disabled={runningSiteId === site.id}>
                          {runningSiteId === site.id ? <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" /> : <Play className="mr-1.5 h-4 w-4" />}
                          Scrape Now
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!sites.length && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No available sites found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h3 className="font-display text-lg font-semibold">Scraping Request Logs</h3>
            <p className="text-sm text-muted-foreground">Newest scraping requests first.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Running">Running</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={siteFilter} onValueChange={setSiteFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Site" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sites</SelectItem>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {/* <th className="p-3">Request ID</th> */}
                <th className="p-3">Site name</th>
                <th className="hidden p-3 md:table-cell">Requested by</th>
                <th className="p-3">Status</th>
                <th className="hidden p-3 lg:table-cell">Started at</th>
                <th className="hidden p-3 lg:table-cell">Finished at</th>
                <th className="p-3">Added</th>
                <th className="p-3">Removed</th>
                <th className="hidden p-3 xl:table-cell">Error</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-muted/30">
                  {/* <td className="p-3 font-medium">{request.requestId}</td> */}
                  <td className="p-3 text-muted-foreground">{request.siteName}</td>
                  <td className="hidden p-3 text-muted-foreground md:table-cell">{request.requestedBy}</td>
                  <td className="p-3"><StatusBadge status={request.status} /></td>
                  <td className="hidden p-3 text-muted-foreground lg:table-cell">{formatDateTime(request.startedAt)}</td>
                  <td className="hidden p-3 text-muted-foreground lg:table-cell">{formatDateTime(request.finishedAt)}</td>
                  <td className="p-3 text-success">+{request.addedCount}</td>
                  <td className="p-3 text-destructive">{request.removedCount}</td>
                  <td className="hidden max-w-xs truncate p-3 text-muted-foreground xl:table-cell">{request.errorMessage || "-"}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => openRequestLogs(request)}>View Logs</Button>
                  </td>
                </tr>
              ))}
              {!requests.length && (
                <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">No scraping requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={Boolean(logTarget)} onOpenChange={(open) => !open && setLogTarget(null)}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-hidden">
          {logTarget && (
            <>
              <DialogHeader>
                <DialogTitle>{logTarget.title}</DialogTitle>
                <DialogDescription>{logTarget.subtitle}</DialogDescription>
              </DialogHeader>
              <div className="max-h-[58vh] overflow-y-auto rounded-md border border-border">
                {logsLoading ? (
                  <p className="p-4 text-sm text-muted-foreground">Loading logs...</p>
                ) : logs.length ? (
                  <div className="divide-y divide-border">
                    {logs.map((log, index) => (
                      <div key={`${log.time}-${index}`} className="p-4 text-sm">
                        <p className="whitespace-pre-wrap break-words font-medium">{log.msg}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(log.time)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="p-4 text-sm text-muted-foreground">No logs recorded yet.</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLogTarget(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
