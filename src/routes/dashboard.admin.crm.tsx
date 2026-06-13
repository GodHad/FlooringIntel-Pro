import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, StatusBadge } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  authService,
  crmService,
  type CrmImportResult,
  type CrmLead,
  type CrmLeadDetail,
  type CrmLeadParams,
  type CrmMarketingSettings,
} from "@/services/api";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Ban,
  ExternalLink,
  Eye,
  Megaphone,
  Pencil,
  RotateCcw,
  Search,
  ShieldCheck,
  Upload,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin/crm")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "CRM - FlooringIntel" }] }),
  component: AdminCrmPage,
});

const PAGE_SIZE = 25;
const TABLE_COL_SPAN = 21;

const SUMMARY_CARDS = [
  ["Total leads", "total_leads"],
  ["Qualified leads", "qualified_leads"],
  ["Approved for outreach", "approved_for_outreach"],
  ["Marketing enabled", "marketing_enabled"],
  ["Marketing disabled", "marketing_disabled"],
  ["Emails sent today", "emails_sent_today"],
  ["Opened emails", "opened_emails"],
  ["Replied leads", "replied_leads"],
  ["Registered leads", "registered_leads"],
  ["Bounced / failed", "bounced_failed_leads"],
  ["Do Not Contact", "do_not_contact_leads"],
] as const;

const STATUS_OPTIONS = [
  "imported",
  "approved",
  "not_started",
  "sample_report_sent",
  "follow_up_1_sent",
  "follow_up_2_sent",
  "engaged_extra_follow_up_sent",
  "completed",
  "registered",
  "replied",
  "not_interested",
  "do_not_contact",
  "unsubscribed",
  "bounced",
  "failed",
];
const SEGMENT_OPTIONS = [
  "flooring_retailer",
  "carpet_rug_business",
  "interior_designer",
  "home_decor_furniture",
  "manufacturer_distributor",
  "adjacent",
  "unknown",
];
const QUALIFICATION_OPTIONS = [
  "imported",
  "high_priority",
  "qualified",
  "needs_review",
  "low_priority",
  "rejected",
];

const formatLabel = (value: string) => value
  .split("_")
  .filter(Boolean)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");
const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : "-");
const boolLabel = (value: boolean) => (value ? "Yes" : "No");

function AdminCrmPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [segment, setSegment] = useState("all");
  const [qualificationStatus, setQualificationStatus] = useState("all");
  const [approved, setApproved] = useState("all");
  const [registered, setRegistered] = useState("all");
  const [opened, setOpened] = useState("all");
  const [doNotContact, setDoNotContact] = useState("all");
  const [source, setSource] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<CrmImportResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [detailLead, setDetailLead] = useState<CrmLead | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState<Partial<CrmMarketingSettings>>({});

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: authService.getCurrentUser,
  });

  const settingsQuery = useQuery({
    queryKey: ["admin-crm-settings"],
    queryFn: crmService.getSettings,
    enabled: user?.role === "Admin",
  });

  useEffect(() => {
    if (settingsQuery.data) setSettingsForm(settingsQuery.data);
  }, [settingsQuery.data]);

  const params = useMemo<CrmLeadParams>(() => ({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    status: status === "all" ? undefined : status,
    segment: segment === "all" ? undefined : segment,
    source: source.trim() || undefined,
    qualification_status: qualificationStatus === "all" ? undefined : qualificationStatus,
    approved: approved === "all" ? undefined : approved,
    registered: registered === "all" ? undefined : registered,
    opened: opened === "all" ? undefined : opened,
    do_not_contact: doNotContact === "all" ? undefined : doNotContact,
    min_score: minScore === "" ? undefined : Number(minScore),
    max_score: maxScore === "" ? undefined : Number(maxScore),
    sort_by: sortBy,
    sort_dir: sortDir,
  }), [
    approved,
    doNotContact,
    maxScore,
    minScore,
    opened,
    page,
    qualificationStatus,
    registered,
    search,
    segment,
    sortBy,
    sortDir,
    source,
    status,
  ]);

  const leadsQuery = useQuery({
    queryKey: ["admin-crm-leads", params],
    queryFn: () => crmService.getLeads(params),
    enabled: user?.role === "Admin",
  });

  const detailQuery = useQuery({
    queryKey: ["admin-crm-lead", detailLead?.id],
    queryFn: () => crmService.getLead(detailLead!.id),
    enabled: Boolean(detailLead),
  });

  const invalidateLeads = async () => {
    setSelectedIds([]);
    await queryClient.invalidateQueries({ queryKey: ["admin-crm-leads"] });
  };

  const importMutation = useMutation({
    mutationFn: (file: File) => crmService.importCsv(file),
    onSuccess: async (result) => {
      setImportResult(result);
      setCsvFile(null);
      await invalidateLeads();
      toast.success("CSV import completed");
    },
    onError: (error: Error) => toast.error(error.message || "CSV import failed"),
  });

  const runBulkAction = async (label: string, action: (ids: string[]) => Promise<unknown>) => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one lead.");
      return;
    }
    await action(selectedIds);
    await invalidateLeads();
    toast.success(label);
  };

  const bulkMutation = useMutation({
    mutationFn: ({ label, action }: { label: string; action: (ids: string[]) => Promise<unknown> }) => runBulkAction(label, action),
    onError: (error: Error) => toast.error(error.message || "Bulk action failed"),
  });

  const settingsMutation = useMutation({
    mutationFn: (payload: Partial<CrmMarketingSettings>) => crmService.updateSettings(payload),
    onSuccess: async (settings) => {
      setSettingsForm(settings);
      await queryClient.invalidateQueries({ queryKey: ["admin-crm-settings"] });
      toast.success(settings.crm_marketing_enabled ? "CRM marketing enabled" : "CRM marketing settings saved");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to save CRM settings"),
  });

  const leadActionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => crmService.runLeadAction(id, action),
    onSuccess: async (lead) => {
      setDetailLead(lead);
      await queryClient.invalidateQueries({ queryKey: ["admin-crm-leads"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-crm-lead", lead.id] });
      toast.success("Lead updated");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to update lead"),
  });

  const testEmailMutation = useMutation({
    mutationFn: ({ id, emailType }: { id: string; emailType: string }) => crmService.sendLeadTestEmail(id, emailType),
    onSuccess: async () => {
      if (detailLead?.id) await queryClient.invalidateQueries({ queryKey: ["admin-crm-lead", detailLead.id] });
      toast.success("Test email queued");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to send test email"),
  });

  if (userLoading) return null;

  if (user?.role !== "Admin") {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <h1 className="font-display text-2xl font-semibold">403 Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">CRM is available to Admin users only.</p>
      </Card>
    );
  }

  const data = leadsQuery.data;
  const leads = data?.data ?? [];
  const pagination = data?.pagination ?? { page, limit: PAGE_SIZE, total: 0, total_pages: 1 };
  const summary = data?.summary;
  const settings = settingsQuery.data;
  const effectiveDetail = detailQuery.data ?? (detailLead ? { lead: detailLead, emailLogs: [] } satisfies CrmLeadDetail : null);
  const pageIds = leads.map((lead) => lead.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const resetPage = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
    setSelectedIds([]);
  };

  const toggleLead = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const togglePage = () => {
    setSelectedIds((current) => (allPageSelected
      ? current.filter((id) => !pageIds.includes(id))
      : Array.from(new Set([...current, ...pageIds]))));
  };

  const updateSort = (field: string) => {
    setPage(1);
    setSelectedIds([]);
    if (sortBy === field) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(field);
    setSortDir("desc");
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="CRM" description="Manage imported leads, outreach approval, marketing status, and email engagement." />
        <div className="mt-1 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setSettingsOpen((open) => !open)}>Settings</Button>
          <Button
            variant={settings?.crm_marketing_enabled ? "destructive" : "default"}
            disabled={settingsMutation.isPending || settingsQuery.isLoading}
            onClick={() => settingsMutation.mutate({ ...settings, crm_marketing_enabled: !settings?.crm_marketing_enabled })}
          >
            <Megaphone className="mr-2 h-4 w-4" /> {settings?.crm_marketing_enabled ? "Disable Marketing" : "Enable Marketing"}
          </Button>
        </div>
      </div>

      {settings && !settings.crm_marketing_enabled && (
        <Card className="mb-6 border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p className="font-semibold">Marketing Disabled</p>
          <p className="mt-1 text-sm">CRM outreach settings are saved, but future marketing cron jobs must not send emails until marketing is enabled.</p>
        </Card>
      )}

      {settingsOpen && (
        <CrmSettingsPanel
          value={settingsForm}
          onChange={setSettingsForm}
          onSave={() => settingsMutation.mutate(settingsForm)}
          saving={settingsMutation.isPending}
        />
      )}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {SUMMARY_CARDS.map(([label, key]) => (
          <Card key={key} className="p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{summary?.[key] ?? 0}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-72 flex-1">
            <h2 className="font-display text-lg font-semibold">Upload Customer CSV</h2>
            <p className="mt-1 text-sm text-muted-foreground">Upload leads with company name, email, phone, country, address, website URL, description, and source.</p>
            <Input className="mt-4 max-w-md" type="file" accept=".csv,text/csv" onChange={(event) => setCsvFile(event.target.files?.[0] ?? null)} />
          </div>
          <Button disabled={!csvFile || importMutation.isPending} onClick={() => csvFile && importMutation.mutate(csvFile)}>
            <Upload className="mr-2 h-4 w-4" /> {importMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </div>
        {importResult && (
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <ImportStat label="Total rows" value={importResult.total_rows} />
            <ImportStat label="Imported" value={importResult.imported_count} />
            <ImportStat label="Duplicate emails" value={importResult.skipped_duplicate_count} />
            <ImportStat label="Invalid rows" value={importResult.skipped_invalid_count} />
            <ImportStat label="Qualified" value={importResult.qualified_count} />
            <ImportStat label="Needs review" value={importResult.needs_review_count} />
            <ImportStat label="Low priority" value={importResult.low_priority_count} />
          </div>
        )}
      </Card>

      <Card className="mb-4 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
                setSelectedIds([]);
              }}
              placeholder="Search by company or email..."
              className="pl-9"
            />
          </div>
          <FilterSelect label="Marketing status" value={status} onChange={resetPage(setStatus)} options={STATUS_OPTIONS} />
          <FilterSelect label="Segment" value={segment} onChange={resetPage(setSegment)} options={SEGMENT_OPTIONS} />
          <FilterSelect label="Qualification" value={qualificationStatus} onChange={resetPage(setQualificationStatus)} options={QUALIFICATION_OPTIONS} />
          <FilterSelect label="Approved" value={approved} onChange={resetPage(setApproved)} options={["true", "false"]} labels={{ true: "Approved", false: "Not approved" }} />
          <FilterSelect label="Registered" value={registered} onChange={resetPage(setRegistered)} options={["true", "false"]} labels={{ true: "Registered", false: "Not registered" }} />
          <FilterSelect label="Opened" value={opened} onChange={resetPage(setOpened)} options={["true", "false"]} labels={{ true: "Opened", false: "Not opened" }} />
          <FilterSelect label="Do Not Contact" value={doNotContact} onChange={resetPage(setDoNotContact)} options={["true", "false"]} labels={{ true: "Do Not Contact", false: "Contact allowed" }} />
          <div className="space-y-1.5">
            <Label>Source</Label>
            <Input
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                setPage(1);
                setSelectedIds([]);
              }}
              placeholder="Source"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label>Min score</Label>
              <Input type="number" value={minScore} onChange={(event) => { setMinScore(event.target.value); setPage(1); setSelectedIds([]); }} />
            </div>
            <div className="space-y-1.5">
              <Label>Max score</Label>
              <Input type="number" value={maxScore} onChange={(event) => { setMaxScore(event.target.value); setPage(1); setSelectedIds([]); }} />
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-auto text-sm text-muted-foreground">{selectedIds.length} selected</span>
          <Button size="sm" disabled={!selectedIds.length || bulkMutation.isPending} onClick={() => bulkMutation.mutate({ label: "Selected leads approved", action: crmService.bulkApprove })}>
            <ShieldCheck className="mr-2 h-4 w-4" /> Approve selected
          </Button>
          <Button size="sm" variant="outline" disabled={!selectedIds.length || bulkMutation.isPending} onClick={() => bulkMutation.mutate({ label: "Selected leads unapproved", action: crmService.bulkUnapprove })}>Unapprove selected</Button>
          <Button size="sm" variant="outline" disabled={!selectedIds.length || bulkMutation.isPending} onClick={() => bulkMutation.mutate({ label: "Selected leads marked not interested", action: crmService.bulkNotInterested })}>
            <UserX className="mr-2 h-4 w-4" /> Not Interested
          </Button>
          <Button size="sm" variant="outline" disabled={!selectedIds.length || bulkMutation.isPending} onClick={() => bulkMutation.mutate({ label: "Selected leads marked Do Not Contact", action: crmService.bulkDoNotContact })}>
            <Ban className="mr-2 h-4 w-4" /> Do Not Contact
          </Button>
          <Button size="sm" variant="outline" disabled={!selectedIds.length || bulkMutation.isPending} onClick={() => bulkMutation.mutate({ label: "Lead scores recalculated", action: crmService.recalculateScore })}>
            <RotateCcw className="mr-2 h-4 w-4" /> Recalculate score
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[2200px] text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3"><Checkbox checked={allPageSelected} onCheckedChange={togglePage} /></th>
                <th className="p-3"><SortHeader label="Lead Score" field="lead_score" sortBy={sortBy} sortDir={sortDir} onSort={updateSort} /></th>
                <th className="p-3"><SortHeader label="Segment" field="lead_segment" sortBy={sortBy} sortDir={sortDir} onSort={updateSort} /></th>
                <th className="p-3"><SortHeader label="Company Name" field="company_name" sortBy={sortBy} sortDir={sortDir} onSort={updateSort} /></th>
                <th className="p-3"><SortHeader label="Email" field="email" sortBy={sortBy} sortDir={sortDir} onSort={updateSort} /></th>
                <th className="p-3">Phone</th>
                <th className="p-3">Country</th>
                <th className="p-3">Source</th>
                <th className="p-3">Approved for Outreach</th>
                <th className="p-3"><SortHeader label="Marketing Status" field="marketing_status" sortBy={sortBy} sortDir={sortDir} onSort={updateSort} /></th>
                <th className="p-3"><SortHeader label="Total Emails Sent" field="total_email_count" sortBy={sortBy} sortDir={sortDir} onSort={updateSort} /></th>
                <th className="p-3"><SortHeader label="Report Emails Sent" field="report_email_count" sortBy={sortBy} sortDir={sortDir} onSort={updateSort} /></th>
                <th className="p-3"><SortHeader label="Open Count" field="open_count" sortBy={sortBy} sortDir={sortDir} onSort={updateSort} /></th>
                <th className="p-3"><SortHeader label="First Opened At" field="first_opened_at" sortBy={sortBy} sortDir={sortDir} onSort={updateSort} /></th>
                <th className="p-3"><SortHeader label="Last Opened At" field="last_opened_at" sortBy={sortBy} sortDir={sortDir} onSort={updateSort} /></th>
                <th className="p-3">Replied</th>
                <th className="p-3">Registered</th>
                <th className="p-3"><SortHeader label="Last Email Sent At" field="last_email_sent_at" sortBy={sortBy} sortDir={sortDir} onSort={updateSort} /></th>
                <th className="p-3"><SortHeader label="Next Email At" field="next_email_at" sortBy={sortBy} sortDir={sortDir} onSort={updateSort} /></th>
                <th className="p-3"><SortHeader label="Created At" field="created_at" sortBy={sortBy} sortDir={sortDir} onSort={updateSort} /></th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leadsQuery.isLoading && <tr><td colSpan={TABLE_COL_SPAN} className="p-8 text-center text-muted-foreground">Loading CRM leads...</td></tr>}
              {!leadsQuery.isLoading && leads.length === 0 && <tr><td colSpan={TABLE_COL_SPAN} className="p-10 text-center text-muted-foreground">No customer leads found.</td></tr>}
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/30">
                  <td className="p-3"><Checkbox checked={selectedIds.includes(lead.id)} onCheckedChange={() => toggleLead(lead.id)} /></td>
                  <td className="p-3 font-medium">{lead.lead_score}</td>
                  <td className="p-3">{formatLabel(lead.lead_segment || "unknown")}</td>
                  <td className="p-3 font-medium">
                    <span className="inline-flex max-w-[260px] items-center gap-1.5 align-middle">
                      <span className="truncate">{lead.company_name || "-"}</span>
                      {lead.website_url && (
                        <a className="shrink-0 text-primary hover:text-primary/80" href={lead.website_url} target="_blank" rel="noreferrer" title="Open website">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{lead.email}</td>
                  <td className="p-3 text-muted-foreground">{lead.phone || "-"}</td>
                  <td className="p-3 text-muted-foreground">{lead.country || "-"}</td>
                  <td className="p-3 text-muted-foreground">{lead.source || "-"}</td>
                  <td className="p-3">{boolLabel(lead.approved_for_outreach)}</td>
                  <td className="p-3"><StatusBadge status={formatLabel(lead.marketing_status)} /></td>
                  <td className="p-3">{lead.total_email_count}</td>
                  <td className="p-3">{lead.report_email_count}</td>
                  <td className="p-3">{lead.open_count}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(lead.first_opened_at)}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(lead.last_opened_at)}</td>
                  <td className="p-3">{boolLabel(lead.reply_detected)}</td>
                  <td className="p-3">{boolLabel(lead.registered)}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(lead.last_email_sent_at)}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(lead.next_email_at)}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(lead.created_at)}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" title="View details" onClick={() => setDetailLead(lead)}><Eye className="h-4 w-4" /></Button>
                      <ActionButton label="Edit lead" icon={<Pencil className="h-4 w-4" />} />
                      <ActionButton label="Approve lead" icon={<ShieldCheck className="h-4 w-4" />} />
                      <ActionButton label="Mark Do Not Contact" icon={<Ban className="h-4 w-4" />} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-sm text-muted-foreground">
          <span>Total {pagination.total} leads</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => { setPage((value) => Math.max(value - 1, 1)); setSelectedIds([]); }}>Prev</Button>
            <span>Page {pagination.page} of {pagination.total_pages}</span>
            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.total_pages} onClick={() => { setPage((value) => value + 1); setSelectedIds([]); }}>Next</Button>
          </div>
        </div>
      </Card>

      <LeadDetailSheet
        detail={effectiveDetail}
        loading={detailQuery.isLoading}
        actionPending={leadActionMutation.isPending || testEmailMutation.isPending}
        onAction={(action) => detailLead && leadActionMutation.mutate({ id: detailLead.id, action })}
        onSendTestEmail={(emailType) => detailLead && testEmailMutation.mutate({ id: detailLead.id, emailType })}
        onOpenChange={(open) => !open && setDetailLead(null)}
      />
    </div>
  );
}

function ImportStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, labels = {} }: { label: string; value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string>; }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((option) => <SelectItem key={option} value={option}>{labels[option] ?? formatLabel(option)}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function CrmSettingsPanel({ value, onChange, onSave, saving }: { value: Partial<CrmMarketingSettings>; onChange: (value: Partial<CrmMarketingSettings>) => void; onSave: () => void; saving: boolean; }) {
  const update = (field: keyof CrmMarketingSettings, nextValue: string | number | boolean) => onChange({ ...value, [field]: nextValue });

  return (
    <Card className="mb-6 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-semibold">CRM Marketing Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">These settings prepare controlled outreach. No cron emails are started from this page.</p>
        </div>
        <Badge variant={value.crm_marketing_enabled ? "default" : "secondary"}>{value.crm_marketing_enabled ? "Enabled" : "Disabled"}</Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Daily new lead limit</Label>
          <Input type="number" min={0} value={value.crm_daily_new_lead_limit ?? 20} onChange={(event) => update("crm_daily_new_lead_limit", Number(event.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label>Max daily limit</Label>
          <Input type="number" min={0} value={value.crm_max_daily_new_lead_limit ?? 50} onChange={(event) => update("crm_max_daily_new_lead_limit", Number(event.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label>Sender name</Label>
          <Input value={value.crm_sender_name ?? ""} onChange={(event) => update("crm_sender_name", event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Sender email</Label>
          <Input value={value.crm_sender_email ?? ""} onChange={(event) => update("crm_sender_email", event.target.value)} placeholder="marketing@flooringintel.com" />
        </div>
        <div className="space-y-1.5">
          <Label>Sample report URL</Label>
          <Input value={value.crm_report_url ?? ""} onChange={(event) => update("crm_report_url", event.target.value)} placeholder="https://..." />
        </div>
        <div className="space-y-1.5">
          <Label>Signup URL</Label>
          <Input value={value.crm_signup_url ?? ""} onChange={(event) => update("crm_signup_url", event.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button disabled={saving} onClick={onSave}>{saving ? "Saving..." : "Save settings"}</Button>
      </div>
    </Card>
  );
}
function SortHeader({ label, field, sortBy, sortDir, onSort }: { label: string; field: string; sortBy: string; sortDir: "asc" | "desc"; onSort: (field: string) => void; }) {
  const active = sortBy === field;
  const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <button type="button" className="inline-flex items-center gap-1 font-medium text-left hover:text-foreground" onClick={() => onSort(field)}>
      {label}
      <Icon className={active ? "h-3.5 w-3.5 text-primary" : "h-3.5 w-3.5 text-muted-foreground"} />
    </button>
  );
}

function ActionButton({ label, icon }: { label: string; icon: ReactNode }) {
  return <Button size="sm" variant="ghost" title={label} onClick={() => toast.info(label + " will be added in the next CRM part.")}>{icon}</Button>;
}

function LeadDetailSheet({ detail, loading, actionPending, onAction, onSendTestEmail, onOpenChange }: { detail: CrmLeadDetail | null; loading: boolean; actionPending: boolean; onAction: (action: string) => void; onSendTestEmail: (emailType: string) => void; onOpenChange: (open: boolean) => void }) {
  const lead = detail?.lead ?? null;
  const scoreReasons = lead ? getScoreReasons(lead) : [];
  const emailLogs = detail?.emailLogs ?? [];

  return (
    <Sheet open={Boolean(lead)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        {lead && (
          <>
            <SheetHeader>
              <SheetTitle>{lead.company_name || "Lead details"}</SheetTitle>
              <SheetDescription>{loading ? "Loading latest CRM activity..." : lead.email}</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <section>
                <h3 className="text-sm font-semibold">Actions</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={actionPending} onClick={() => onAction(lead.approved_for_outreach ? "unapprove" : "approve")}>{lead.approved_for_outreach ? "Unapprove outreach" : "Approve outreach"}</Button>
                  <Button size="sm" variant="outline" disabled={actionPending} onClick={() => onAction(lead.marketing_enabled ? "disable_marketing" : "enable_marketing")}>{lead.marketing_enabled ? "Disable marketing" : "Enable marketing"}</Button>
                  <Button size="sm" variant="outline" disabled={actionPending} onClick={() => onAction("mark_replied")}>Mark Replied</Button>
                  <Button size="sm" variant="outline" disabled={actionPending} onClick={() => onAction("mark_not_interested")}>Not Interested</Button>
                  <Button size="sm" variant="outline" disabled={actionPending} onClick={() => onAction("mark_do_not_contact")}>Do Not Contact</Button>
                  <Button size="sm" variant="outline" disabled={actionPending} onClick={() => onAction("mark_bounced")}>Bounced</Button>
                  <Button size="sm" variant="outline" disabled={actionPending} onClick={() => onAction("mark_unsubscribed")}>Unsubscribed</Button>
                  <Button size="sm" variant="outline" disabled={actionPending} onClick={() => onAction("reset_marketing")}>Reset marketing</Button>
                  <Button size="sm" disabled={actionPending} onClick={() => onSendTestEmail("sample_report")}>Send test email</Button>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold">Lead score</h3>
                <div className="mt-3 rounded-md border border-border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-3xl font-semibold">{lead.lead_score}</span>
                    <Badge variant="secondary">{formatLabel(lead.qualification_status || "unknown")}</Badge>
                    <Badge variant="outline">{formatLabel(lead.lead_segment || "unknown")}</Badge>
                  </div>
                  {lead.recommended_action && <p className="mt-3 text-sm text-muted-foreground">{lead.recommended_action}</p>}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold">Scoring reasons</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {scoreReasons.length > 0 ? scoreReasons.join(", ") : "No scoring reasons recorded."}
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold">Lead info</h3>
                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <DetailItem label="Company" value={lead.company_name} />
                  <DetailItem label="Email" value={lead.email} />
                  <DetailItem label="Phone" value={lead.phone} />
                  <DetailItem label="Country" value={lead.country} />
                  <DetailItem label="Address" value={lead.address} className="sm:col-span-2" />
                  <DetailItem label="Source" value={lead.source} />
                  <DetailItem label="Description" value={lead.description} className="sm:col-span-2" />
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Website</p>
                    {lead.website_url ? (
                      <a className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline" href={lead.website_url} target="_blank" rel="noreferrer">
                        {lead.website_url}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : <p className="mt-1">-</p>}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold">Marketing info</h3>
                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <DetailItem label="Marketing status" value={formatLabel(lead.marketing_status)} />
                  <DetailItem label="Marketing enabled" value={boolLabel(lead.marketing_enabled)} />
                  <DetailItem label="Approved for outreach" value={boolLabel(lead.approved_for_outreach)} />
                  <DetailItem label="Report email count" value={String(lead.report_email_count)} />
                  <DetailItem label="Total email count" value={String(lead.total_email_count)} />
                  <DetailItem label="Open count" value={String(lead.open_count)} />
                  <DetailItem label="First opened" value={formatDate(lead.first_opened_at)} />
                  <DetailItem label="Last opened" value={formatDate(lead.last_opened_at)} />
                  <DetailItem label="Last engagement" value={formatDate(lead.last_engagement_at)} />
                  <DetailItem label="Last sent" value={formatDate(lead.last_email_sent_at)} />
                  <DetailItem label="Next email" value={formatDate(lead.next_email_at)} />
                  <DetailItem label="Registered" value={boolLabel(lead.registered)} />
                  <DetailItem label="Do not contact" value={boolLabel(lead.do_not_contact)} />
                  <DetailItem label="Unsubscribe requested" value={boolLabel(lead.unsubscribe_requested)} />
                  <DetailItem label="Bounce detected" value={boolLabel(lead.bounce_detected)} />
                  <DetailItem label="Last error" value={lead.last_error} className="sm:col-span-2" />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold">Email logs</h3>
                {emailLogs.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {emailLogs.map((log) => (
                      <div key={log.id} className="rounded-md border border-border p-3 text-sm">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{formatLabel(log.email_type)}</p>
                            <p className="text-muted-foreground">{log.subject || "-"}</p>
                          </div>
                          <StatusBadge status={formatLabel(log.status)} />
                        </div>
                        <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                          <span>Sent: {formatDate(log.sent_at)}</span>
                          <span>Opened: {boolLabel(log.opened)} ({log.open_count})</span>
                          <span>Clicked: {boolLabel(log.clicked)}</span>
                          <span>First opened: {formatDate(log.first_opened_at)}</span>
                          <span>Last opened: {formatDate(log.last_opened_at)}</span>
                          <span>Error: {log.error_message || "-"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">No marketing email logs yet.</p>
                )}
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
function DetailItem({ label, value, className = "" }: { label: string; value?: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words">{value || "-"}</p>
    </div>
  );
}

function getScoreReasons(lead: CrmLead) {
  if (Array.isArray(lead.score_reasons) && lead.score_reasons.length > 0) return lead.score_reasons;
  if (!lead.scoreReasons) return [];
  return lead.scoreReasons.split(";").map((reason) => reason.trim()).filter(Boolean);
}








