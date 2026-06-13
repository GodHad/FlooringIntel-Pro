import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader, StatusBadge } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { invoiceService } from "@/services/invoices";
import type { Invoice } from "@/data/invoices";
import { Download, Eye, FileText } from "lucide-react";
import { InvoiceCard } from "./dashboard.subscriptions.checkout";

export const Route = createFileRoute("/dashboard/invoices")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "My Invoices - FlooringIntel" }] }),
  component: InvoicesPage,
});

const getSiteNames = (invoice: Invoice) => (
  invoice.items?.length
    ? invoice.items.map((item) => item.websiteName).join(", ")
    : invoice.subscription.planName
);

function InvoicesPage() {
  const [selected, setSelected] = useState<Invoice | null>(null);
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => invoiceService.getInvoices(),
  });

  const download = async (invoice: Invoice) => {
    const blob = await invoiceService.downloadInvoice(invoice.id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader title="My Invoices" description="View Stripe subscription invoices and payment status." />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Plan / websites</th>
                <th className="hidden p-3 md:table-cell">Stripe</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="hidden p-3 lg:table-cell">Created</th>
                <th className="hidden p-3 lg:table-cell">Updated</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading invoices...</td></tr>
              )}
              {!isLoading && invoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-muted-foreground">
                    <FileText className="mx-auto mb-2 h-8 w-8 opacity-60" />
                    No invoices yet.
                  </td>
                </tr>
              )}
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-muted/30">
                  <td className="p-3 font-medium">{invoice.id}</td>
                  <td className="max-w-xs truncate p-3 text-muted-foreground">
                    <span className="font-medium text-foreground">{invoice.plan?.name ?? invoice.subscription.planName}</span>
                    <span className="block truncate">{getSiteNames(invoice)}</span>
                  </td>
                  <td className="hidden p-3 text-muted-foreground md:table-cell">
                    {invoice.stripeStatus || invoice.paymentType}
                    {invoice.stripeSubscriptionId && <span className="block truncate text-xs">{invoice.stripeSubscriptionId}</span>}
                  </td>
                  <td className="p-3 font-medium">{invoice.currency} {(invoice.total ?? invoice.price).toFixed(2)}</td>
                  <td className="p-3"><StatusBadge status={invoice.status} /></td>
                  <td className="hidden p-3 text-muted-foreground lg:table-cell">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                  <td className="hidden p-3 text-muted-foreground lg:table-cell">{new Date(invoice.updatedAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => setSelected(invoice)}><Eye className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => download(invoice)}><Download className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle>Invoice details</SheetTitle>
            <SheetDescription>Stripe payment record for {selected?.id}</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="mt-5 space-y-4">
              <InvoiceCard invoice={selected} onDownload={() => download(selected)} />
              <Card className="p-4">
                <p className="font-medium">Status timeline</p>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <Timeline label="Checkout Created" date={selected.createdAt} />
                  <Timeline label="Stripe Paid" date={selected.paidAt} />
                  <Timeline label="Subscription Activated" date={selected.completedAt} />
                </div>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Timeline({ label, date }: { label: string; date?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
      <span>{label}</span>
      <span>{date ? new Date(date).toLocaleString() : "-"}</span>
    </div>
  );
}
