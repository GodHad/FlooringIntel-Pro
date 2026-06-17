import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, StatusBadge } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { authService, downloadService, websiteService } from "@/services/api";
import { Download, FileSpreadsheet, SlidersHorizontal, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard/downloads")({
  head: () => ({ meta: [{ title: "Downloads — FlooringIntel" }] }),
  component: DownloadsPage,
});

function DownloadsPage() {
  const queryClient = useQueryClient();
  const { data: websites = [] } = useQuery({ queryKey: ["websites"], queryFn: () => websiteService.getWebsites() });
  const { data: exports_ = [] } = useQuery({ queryKey: ["exports"], queryFn: downloadService.getExportHistory });
  const { data: user } = useQuery({ queryKey: ["current-user"], queryFn: authService.getCurrentUser });
  const isAdmin = user?.role === "Admin";
  const hasUnlimitedAccess = user?.role === "Admin" || user?.role === "Partner";
  const subscribedWebsites = hasUnlimitedAccess ? websites : websites.filter((website) => website.subscribed);
  const [website, setWebsite] = useState("all");
  const [status, setStatus] = useState("all");
  const [useDateRange, setUseDateRange] = useState(false);
  const [addedFrom, setAddedFrom] = useState("");
  const [addedTo, setAddedTo] = useState("");
  const [q, setQ] = useState("");

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="Downloads" description="Export carpet product data to Excel" />
        <Button asChild variant="outline" size="sm" className="mt-1">
          <Link to="/dashboard/downloads/customize">
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Customize export fields
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <h3 className="font-display text-lg font-semibold">Create export</h3>
          <p className="text-sm text-muted-foreground">Create export from selected filters.</p>
          {!hasUnlimitedAccess && subscribedWebsites.length === 0 && (
            <div className="mt-4 rounded-md border border-border bg-secondary/40 p-3 text-sm">
              <p className="text-muted-foreground">No export-enabled websites are available for your account yet. Please contact an administrator.</p>
            </div>
          )}
          <form
            className="mt-5 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const filters = {
                website: website === "all" ? undefined : website,
                availability: status === "available"
                  ? "In Stock"
                  : status === "deleted"
                    ? "Out of Stock"
                    : undefined,
                addedFrom: useDateRange ? addedFrom || undefined : undefined,
                addedTo: useDateRange ? addedTo || undefined : undefined,
                q: q.trim() || undefined,
              };

              await downloadService.createExport({
                type: "filtered",
                website: website === "all" ? undefined : website,
                dateRange: useDateRange ? `${addedFrom || "Any"} - ${addedTo || "Any"}` : undefined,
                filters,
              });
              await queryClient.invalidateQueries({ queryKey: ["exports"] });
              toast.success("Export added to history. Download it from export history.");
            }}
          >
            <div className="space-y-2">
              <Label>Website</Label>
              <Select value={website} onValueChange={setWebsite}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All websites</SelectItem>
                  {subscribedWebsites.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Search product, SKU, color..."
              />
            </div>

            <div className="flex items-center gap-2 rounded-md border border-border p-3">
              <Checkbox
                id="download-date-range"
                checked={useDateRange}
                onCheckedChange={(checked) => setUseDateRange(Boolean(checked))}
              />
              <Label htmlFor="download-date-range" className="cursor-pointer">Date Range</Label>
            </div>

            {useDateRange && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input type="date" value={addedFrom} onChange={(event) => setAddedFrom(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input type="date" value={addedTo} onChange={(event) => setAddedTo(event.target.value)} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Format</Label>
              <Select defaultValue="xlsx">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="xlsx">Excel (.xlsx)</SelectItem></SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!hasUnlimitedAccess && subscribedWebsites.length === 0}
            >
              <Sparkles className="mr-2 h-4 w-4" /> Generate export
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <div className="border-b border-border p-6 pb-4">
            <h3 className="font-display text-lg font-semibold">Export history</h3>
            <p className="text-sm text-muted-foreground">Past exports and their status</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">File</th>
                  {isAdmin && <th className="p-3 hidden lg:table-cell">User</th>}
                  <th className="p-3 hidden md:table-cell">Type</th>
                  <th className="p-3 hidden lg:table-cell">Scope</th>
                  <th className="p-3 hidden md:table-cell">Created</th>
                  <th className="p-3">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exports_.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-success" />
                        <span className="font-medium">{e.fileName}</span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="p-3 hidden lg:table-cell text-muted-foreground">
                        <p>{e.userName ?? "Unknown"}</p>
                        <p className="text-xs">{e.userEmail}</p>
                      </td>
                    )}
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{e.exportType}</td>
                    <td className="p-3 hidden lg:table-cell text-muted-foreground">{e.website ?? e.dateRange ?? "—"}</td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</td>
                    <td className="p-3"><StatusBadge status={e.status} /></td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={e.status !== "Ready"}
                        onClick={async () => {
                          const download = await downloadService.downloadExportBlob(e.id);
                          const url = window.URL.createObjectURL(download.blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = e.fileName;
                          link.click();
                          window.URL.revokeObjectURL(url);
                          toast.success(download.metadata.limited
                            ? "Your free plan export includes the first 50 products. Upgrade for unlimited exports."
                            : `Downloading ${e.fileName}`);
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

