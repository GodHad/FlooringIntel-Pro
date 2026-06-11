import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatusBadge } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { authService, crmService, type CrmLeadParams } from "@/services/api";
import { Eye, Pencil, ShieldCheck, Ban, Search, Upload, Megaphone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin/crm")({
  head: () => ({ meta: [{ title: "CRM - FlooringIntel" }] }),
  component: AdminCrmPage,
});

const PAGE_SIZE = 25;

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

const STATUS_OPTIONS = ["imported", "approved", "not_started", "sample_report_sent", "follow_up_1_sent", "follow_up_2_sent", "engaged_extra_follow_up_sent", "completed", "registered", "replied", "not_interested", "do_not_contact", "unsubscribed", "bounced", "failed"];
const SEGMENT_OPTIONS = ["flooring_retailer", "carpet_rug_business", "interior_designer", "home_decor_furniture", "manufacturer_distributor", "adjacent", "unknown"];
const QUALIFICATION_OPTIONS = ["imported", "qualified", "needs_review", "low_priority", "rejected"];

const formatLabel = (value: string) => value.replace(/_/g, " ").replace(/w/g, (char) => char.toUpperCase());
const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : "-");
const boolLabel = (value: boolean) => (value ? "Yes" : "No");

function AdminCrmPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [segment, setSegment] = useState("all");
  const [qualificationStatus, setQualificationStatus] = useState("all");
  const [approved, setApproved] = useState("all");
  const [registered, setRegistered] = useState("all");
  const [opened, setOpened] = useState("all");
  const [source, setSource] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");

  const { data: user, isLoading: userLoading } = useQuery({ queryKey: ["current-user"], queryFn: authService.getCurrentUser });

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
    min_score: minScore === "" ? undefined : Number(minScore),
    max_score: maxScore === "" ? undefined : Number(maxScore),
  }), [approved, maxScore, minScore, opened, page, qualificationStatus, registered, search, segment, source, status]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-crm-leads", params],
    queryFn: () => crmService.getLeads(params),
    enabled: user?.role === "Admin",
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

  const leads = data?.data ?? [];
  const pagination = data?.pagination ?? { page, limit: PAGE_SIZE, total: 0, total_pages: 1 };
  const summary = data?.summary;
  const resetPage = (setter: (value: string) => void) => (value: string) => { setter(value); setPage(1); };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="CRM" description="Manage imported leads, outreach approval, marketing status, and email engagement." />
        <Button disabled variant="outline" className="mt-1"><Megaphone className="mr-2 h-4 w-4" /> Enable Marketing</Button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {SUMMARY_CARDS.map(([label, key]) => (
          <Card key={key} className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{summary?.[key] ?? 0}</p></Card>
        ))}
      </div>

      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Upload Customer CSV</h2>
            <p className="mt-1 text-sm text-muted-foreground">Upload leads with company name, email, phone, country, address, website URL, description, and source.</p>
          </div>
          <Button disabled variant="secondary"><Upload className="mr-2 h-4 w-4" /> Upload CSV</Button>
        </div>
      </Card>

      <Card className="mb-4 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by company or email..." className="pl-9" />
          </div>
          <FilterSelect label="Status" value={status} onChange={resetPage(setStatus)} options={STATUS_OPTIONS} />
          <FilterSelect label="Segment" value={segment} onChange={resetPage(setSegment)} options={SEGMENT_OPTIONS} />
          <FilterSelect label="Qualification" value={qualificationStatus} onChange={resetPage(setQualificationStatus)} options={QUALIFICATION_OPTIONS} />
          <FilterSelect label="Approved" value={approved} onChange={resetPage(setApproved)} options={["true", "false"]} labels={{ true: "Approved", false: "Not approved" }} />
          <FilterSelect label="Registered" value={registered} onChange={resetPage(setRegistered)} options={["true", "false"]} labels={{ true: "Registered", false: "Not registered" }} />
          <FilterSelect label="Opened" value={opened} onChange={resetPage(setOpened)} options={["true", "false"]} labels={{ true: "Opened", false: "Not opened" }} />
          <div className="space-y-1.5"><Label>Source</Label><Input value={source} onChange={(event) => { setSource(event.target.value); setPage(1); }} placeholder="Source" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label>Min score</Label><Input type="number" value={minScore} onChange={(event) => { setMinScore(event.target.value); setPage(1); }} /></div>
            <div className="space-y-1.5"><Label>Max score</Label><Input type="number" value={maxScore} onChange={(event) => { setMaxScore(event.target.value); setPage(1); }} /></div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[2200px] text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3"><Checkbox disabled /></th><th className="p-3">Lead Score</th><th className="p-3">Segment</th><th className="p-3">Company Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Country</th><th className="p-3">Website URL</th><th className="p-3">Source</th><th className="p-3">Approved for Outreach</th><th className="p-3">Marketing Status</th><th className="p-3">Total Emails Sent</th><th className="p-3">Report Emails Sent</th><th className="p-3">Open Count</th><th className="p-3">First Opened At</th><th className="p-3">Last Opened At</th><th className="p-3">Replied</th><th className="p-3">Registered</th><th className="p-3">Last Email Sent At</th><th className="p-3">Next Email At</th><th className="p-3">Created At</th><th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && <tr><td colSpan={22} className="p-8 text-center text-muted-foreground">Loading CRM leads...</td></tr>}
              {!isLoading && leads.length === 0 && <tr><td colSpan={22} className="p-10 text-center text-muted-foreground">No customer leads found.</td></tr>}
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/30">
                  <td className="p-3"><Checkbox disabled /></td><td className="p-3 font-medium">{lead.lead_score}</td><td className="p-3">{formatLabel(lead.lead_segment || "unknown")}</td><td className="p-3 font-medium">{lead.company_name || "-"}</td><td className="p-3 text-muted-foreground">{lead.email}</td><td className="p-3 text-muted-foreground">{lead.phone || "-"}</td><td className="p-3 text-muted-foreground">{lead.country || "-"}</td>
                  <td className="p-3 text-muted-foreground">{lead.website_url ? <a className="text-primary hover:underline" href={lead.website_url} target="_blank" rel="noreferrer">{lead.website_url}</a> : "-"}</td>
                  <td className="p-3 text-muted-foreground">{lead.source || "-"}</td><td className="p-3">{boolLabel(lead.approved_for_outreach)}</td><td className="p-3"><StatusBadge status={formatLabel(lead.marketing_status)} /></td><td className="p-3">{lead.total_email_count}</td><td className="p-3">{lead.report_email_count}</td><td className="p-3">{lead.open_count}</td><td className="p-3 text-muted-foreground">{formatDate(lead.first_opened_at)}</td><td className="p-3 text-muted-foreground">{formatDate(lead.last_opened_at)}</td><td className="p-3">{boolLabel(lead.reply_detected)}</td><td className="p-3">{boolLabel(lead.registered)}</td><td className="p-3 text-muted-foreground">{formatDate(lead.last_email_sent_at)}</td><td className="p-3 text-muted-foreground">{formatDate(lead.next_email_at)}</td><td className="p-3 text-muted-foreground">{formatDate(lead.created_at)}</td>
                  <td className="p-3 text-right"><div className="flex justify-end gap-1"><ActionButton label="View details" icon={<Eye className="h-4 w-4" />} /><ActionButton label="Edit lead" icon={<Pencil className="h-4 w-4" />} /><ActionButton label="Approve lead" icon={<ShieldCheck className="h-4 w-4" />} /><ActionButton label="Mark Do Not Contact" icon={<Ban className="h-4 w-4" />} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-sm text-muted-foreground">
          <span>Total {pagination.total} leads</span>
          <div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPage((value) => Math.max(value - 1, 1))}>Prev</Button><span>Page {pagination.page} of {pagination.total_pages}</span><Button variant="outline" size="sm" disabled={pagination.page >= pagination.total_pages} onClick={() => setPage((value) => value + 1)}>Next</Button></div>
        </div>
      </Card>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, labels = {} }: { label: string; value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string>; }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">All</SelectItem>{options.map((option) => <SelectItem key={option} value={option}>{labels[option] ?? formatLabel(option)}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function ActionButton({ label, icon }: { label: string; icon: React.ReactNode }) {
  return <Button size="sm" variant="ghost" title={label} onClick={() => toast.info(label + " will be added in the next CRM part.")}>{icon}</Button>;
}
