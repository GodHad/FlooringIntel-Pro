import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/DashboardLayout";
import { invoiceService } from "@/services/invoices";
import { InvoiceCard } from "./dashboard.subscriptions.checkout";

export const Route = createFileRoute("/dashboard/invoices/$invoiceId")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Invoice Details - FlooringIntel" }] }),
  component: InvoiceDetailPage,
});

function InvoiceDetailPage() {
  const { invoiceId } = Route.useParams();
  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => invoiceService.getInvoiceById(invoiceId),
  });

  const download = async () => {
    if (!invoice) return;
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
      <PageHeader title="Invoice Details" description={invoiceId} />
      {isLoading && <p className="text-sm text-muted-foreground">Loading invoice...</p>}
      {invoice && <InvoiceCard invoice={invoice} onDownload={download} />}
    </div>
  );
}
