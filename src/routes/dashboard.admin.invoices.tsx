import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatusBadge } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { invoiceService } from "@/services/invoices";
import type { Invoice, InvoiceStatus } from "@/data/invoices";
import { Download, Eye, Search } from "lucide-react";
import { InvoiceCard } from "./dashboard.subscriptions.checkout";

export const Route = createFileRoute("/dashboard/admin/invoices")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Admin Invoices - FlooringIntel" }] }),
  component: AdminInvoicesPage,
});

const STATUSES: InvoiceStatus[] = ["Pending Stripe Checkout", "Paid", "Completed", "Failed", "Cancelled", "Refunded"];

const siteNames = (invoice: Invoice) => (
  invoice.items?.length ? invoice.items.map((item) => item.websiteName).join(", ") : invoice.subscription.planName
);

function AdminInvoicesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Invoice | null>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["admin-invoices", { q, status }],
    queryFn: () => invoiceService.getAdminInvoices({ q, status, paymentType: "Stripe" }),
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (status !== "all" && inv.status !== status) return false;
      if (!term) return true;
      return (
        inv.id.toLowerCase().includes(term) ||
        inv.userName.toLowerCase().includes(term) ||
        inv.userEmail.toLowerCase().includes(term) ||
        siteNames(inv).toLowerCase().includes(term) ||
        (inv.stripeSubscriptionId ?? "").toLowerCase().includes(term)
      );
    });
  }, [invoices, q, status]);

  const download = async (inv: Invoice) => {
    const blob = await invoiceService.downloadInvoice(inv.id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader title="Invoice management" description="Review Stripe-driven invoice and subscription payment records." />

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoice, user, email, website, or Stripe ID..." className="pl-9" />
          </div>
          <div className="w-56">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Invoice</th>
                <th className="p-3">User</th>
                <th className="hidden p-3 md:table-cell">Plan / websites</th>
                <th className="hidden p-3 lg:table-cell">Stripe</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="hidden p-3 lg:table-cell">Created</th>
                <th className="hidden p-3 lg:table-cell">Updated</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">Loading invoices...</td></tr>}
              {!isLoading && filtered.length === 0 && <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">No invoices match your filters.</td></tr>}
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30">
                  <td className="p-3 font-medium">{inv.id}</td>
                  <td className="p-3">
                    <p className="font-medium">{inv.userName}</p>
                    <p className="text-xs text-muted-foreground">{inv.userEmail}</p>
                  </td>
                  <td className="hidden max-w-xs truncate p-3 text-muted-foreground md:table-cell">
                    <span className="font-medium text-foreground">{inv.plan?.name ?? inv.subscription.planName}</span>
                    <span className="block truncate">{(inv.items?.length ?? 1)} sites · {siteNames(inv)}</span>
                  </td>
                  <td className="hidden p-3 text-muted-foreground lg:table-cell">
                    {inv.stripeStatus || "Stripe"}
                    {inv.stripeSubscriptionId && <span className="block max-w-[180px] truncate text-xs">{inv.stripeSubscriptionId}</span>}
                  </td>
                  <td className="p-3 font-medium">{inv.currency} {(inv.total ?? inv.price).toFixed(2)}</td>
                  <td className="p-3"><StatusBadge status={inv.status === "Completed" ? "Activated" : inv.status} /></td>
                  <td className="hidden p-3 text-muted-foreground lg:table-cell">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="hidden p-3 text-muted-foreground lg:table-cell">{new Date(inv.updatedAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => setSelected(inv)}><Eye className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => download(inv)}><Download className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle>Invoice details</SheetTitle>
            <SheetDescription>Full Stripe record for {selected?.id}</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="mt-5 space-y-4">
              <InvoiceCard invoice={selected} onDownload={() => download(selected)} />
              <Card className="p-4 text-sm">
                <p className="font-medium">Stripe details</p>
                <dl className="mt-3 grid gap-2">
                  <Detail label="Customer ID" value={selected.stripeCustomerId} />
                  <Detail label="Subscription ID" value={selected.stripeSubscriptionId} />
                  <Detail label="Stripe Invoice ID" value={selected.stripeInvoiceId} />
                  <Detail label="Payment Intent" value={selected.stripePaymentIntentId} />
                </dl>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[320px] truncate font-medium">{value || "-"}</span>
    </div>
  );
}
