import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatusBadge } from "@/components/DashboardLayout";
import { subscriptionService } from "@/services/api";
import { invoiceService } from "@/services/invoices";
import type { Invoice } from "@/data/invoices";
import { CheckCircle2, ChevronRight, CreditCard, Download, ListChecks } from "lucide-react";
import mainLogo from "@/assets/main-logo-1.png";

type Search = { siteId?: string; siteIds?: string; planId?: string; billingCycle?: "monthly" | "annual"; selectedSiteCount?: number };

export const Route = createFileRoute("/dashboard/subscriptions/checkout")({
  head: () => ({ meta: [{ title: "Checkout - FlooringIntel" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    siteId: typeof s.siteId === "string" ? s.siteId : undefined,
    siteIds: typeof s.siteIds === "string" ? s.siteIds : undefined,
    planId: typeof s.planId === "string" ? s.planId : undefined,
    billingCycle: s.billingCycle === "annual" ? "annual" : "monthly",
    selectedSiteCount: Number.isFinite(Number(s.selectedSiteCount)) ? Number(s.selectedSiteCount) : undefined,
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { siteId, siteIds, planId = "pro", billingCycle: initialCycle = "monthly", selectedSiteCount: initialSiteCount } = useSearch({ from: "/dashboard/subscriptions/checkout" });
  const navigate = useNavigate();
  const selectedIds = (siteIds || siteId || "").split(",").map((id: string) => id.trim()).filter(Boolean);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(initialCycle);
  const [loading, setLoading] = useState(false);

  const { data: overview } = useQuery({ queryKey: ["subscriptions"], queryFn: subscriptionService.getSubscriptions });
  const websites = overview?.websites.filter((website) => selectedIds.includes(website.id)) ?? [];
  const { data: preview } = useQuery({
    queryKey: ["billing-preview", planId, selectedIds, billingCycle, initialSiteCount],
    queryFn: () => subscriptionService.getBillingPreview(planId, selectedIds, false, billingCycle, initialSiteCount),
    enabled: selectedIds.length > 0,
  });
  const plan = preview?.plan ?? overview?.plans.find((item) => item.id === planId || item.slug === planId);
  const selectedSiteCount = preview?.selectedSiteCount ?? initialSiteCount ?? selectedIds.length ?? plan?.websiteLimit ?? 0;
  const features = plan?.features ?? [];
  const basePrice = preview?.basePrice ?? (billingCycle === "annual" ? Number(plan?.annualPrice ?? 0) : Number(plan?.monthlyPrice ?? plan?.price ?? 0));
  const extraSites = Math.max(selectedSiteCount - Number(plan?.websiteLimit || 0), 0);
  const extraSitePriceMonthly = preview?.extraSitePriceMonthly ?? 5;
  const extraSiteUnitPrice = billingCycle === "annual" ? extraSitePriceMonthly * 12 : extraSitePriceMonthly;
  const extraSiteAmount = preview?.extraSiteAmount ?? (extraSites * extraSiteUnitPrice);
  const total = preview?.finalTotal ?? basePrice + extraSiteAmount;
  const currency = plan?.currency ?? "USD";
  const cycleLabel = billingCycle === "annual" ? "Annual" : "Monthly";
  const cycleUnit = billingCycle === "annual" ? "year" : "month";

  const subscribe = async () => {
    if (!plan || selectedIds.length === 0) return;
    setLoading(true);
    try {
      const result = await subscriptionService.createStripeCheckoutSession({
        planId: plan.id || plan.slug,
        billingCycle,
        selectedSiteCount,
        selectedWebsiteIds: selectedIds,
      });
      window.location.href = result.checkoutUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start Stripe checkout");
      setLoading(false);
    }
  };

  return (
    <div>
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/dashboard/subscriptions" className="hover:text-foreground">Subscriptions</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Checkout</span>
      </nav>
      <PageHeader title="Stripe checkout" description="Review your plan and selected websites, then continue to secure Stripe checkout." />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="h-fit p-6 lg:col-span-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Selected plan</p>
          <h3 className="mt-2 font-display text-xl font-semibold">{plan?.name ?? "Selected plan"}</h3>
          <p className="text-sm text-muted-foreground">
            {websites.length} selected websites · {(selectedSiteCount || plan?.websiteLimit) ?? "Custom"} website slots
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button type="button" variant={billingCycle === "monthly" ? "default" : "outline"} onClick={() => setBillingCycle("monthly")}>
              Monthly
            </Button>
            <Button type="button" variant={billingCycle === "annual" ? "default" : "outline"} onClick={() => setBillingCycle("annual")}>
              Annual
            </Button>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            {websites.map((website) => (
              <div key={website.id} className="rounded-md border border-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{website.name}</p>
                    <p className="text-xs text-muted-foreground">{website.domain}</p>
                  </div>
                  <StatusBadge status="Pending" />
                </div>
              </div>
            ))}
            <Row label="Billing cycle" value={cycleLabel} />
            <Row label="Included websites" value={`${plan?.websiteLimit ?? 0}`} />
            <Row label="Selected websites" value={`${websites.length}`} />
            <Row label="Website capacity" value={`${selectedSiteCount} websites`} />
            {extraSites > 0 && (
              <Row label="Additional websites" value={`${extraSites} x $${extraSiteUnitPrice}/${cycleUnit}`} />
            )}
            <Row label={`${cycleLabel} total`} value={plan?.price === null ? "Custom" : `${currency} ${total.toFixed(2)}`} />
          </div>

          <p className="mt-6 text-xs uppercase tracking-wider text-muted-foreground">Included features</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                {feature}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 lg:col-span-3">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-1 h-5 w-5 text-primary" />
            <div>
              <h3 className="font-display text-lg font-semibold">Secure Stripe subscription</h3>
              <p className="text-sm text-muted-foreground">
                Stripe handles the payment and monthly or annual renewal. Your access activates only after Stripe confirms payment through the backend webhook.
              </p>
              <p className="text-sm text-muted-foreground text-red-800">
                FlooringIntel is currently in beta. Online payments are not available yet, but you can contact us to start a trial or request access.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-md border border-border bg-secondary/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Selected plan</span>
              <span className="font-medium">{plan?.name ?? "-"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Billing cycle</span>
              <Badge variant="secondary">{cycleLabel}</Badge>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Included websites</span>
              <span className="font-medium">{plan?.websiteLimit ?? 0}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Selected websites</span>
              <span className="font-medium">{websites.length}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Website capacity</span>
              <span className="font-medium">{selectedSiteCount} websites</span>
            </div>
            <div className="mt-4 rounded-md border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{plan?.name ?? "Selected"} Plan - {cycleLabel}</p>
                  <p className="text-xs text-muted-foreground">Includes {plan?.websiteLimit ?? 0} websites</p>
                </div>
                <span className="font-medium">{currency} {basePrice.toFixed(2)}</span>
              </div>
              {extraSites > 0 && (
                <div className="mt-3 flex items-start justify-between gap-3 border-t border-border pt-3">
                  <div>
                    <p className="font-medium">Additional websites</p>
                    <p className="text-xs text-muted-foreground">
                      {extraSites} extra websites x ${extraSiteUnitPrice}/{cycleUnit}
                    </p>
                  </div>
                  <span className="font-medium">{currency} {extraSiteAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="mt-3 flex items-start justify-between gap-3 border-t border-border pt-3">
                <div>
                  <p className="font-medium">Selected websites</p>
                  <p className="text-xs text-muted-foreground">{websites.map((website) => website.name).join(", ")}</p>
                </div>
                <span className="font-medium">{currency} 0.00</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="font-medium">{cycleLabel} total</span>
              <span className="font-display text-2xl font-semibold">{currency} {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/dashboard/subscriptions" })}>Cancel</Button>
            <Button onClick={subscribe} disabled={true || loading || websites.length === 0 || !plan || plan.price === null}>
              <CreditCard className="mr-2 h-4 w-4" />
              {loading ? "Redirecting..." : "Continue to Stripe"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function formatMoney(currency: string, value?: number | null) {
  return `${currency} ${Number(value ?? 0).toFixed(2)}`;
}

function getInvoiceSummary(invoice: Invoice) {
  const billingCycle = invoice.pricingSummary?.billingCycle ?? (invoice.subscription.planType === "yearly" ? "annual" : "monthly");
  const billingCycleLabel = invoice.pricingSummary?.billingCycleLabel ?? (billingCycle === "annual" ? "Annual" : "Monthly");
  const billingUnit = invoice.pricingSummary?.billingUnit ?? (billingCycle === "annual" ? "year" : "month");
  const selectedWebsiteCount = invoice.pricingSummary?.selectedWebsiteCount ?? invoice.items?.length ?? 0;
  const includedSiteCount = invoice.pricingSummary?.includedSiteCount ?? invoice.includedSiteCount ?? invoice.selectedSiteCount ?? selectedWebsiteCount;
  const websiteCapacity = invoice.pricingSummary?.websiteCapacity ?? invoice.selectedSiteCount ?? Math.max(selectedWebsiteCount, includedSiteCount);
  const extraSiteCount = invoice.pricingSummary?.extraSiteCount ?? invoice.extraSites ?? Math.max(websiteCapacity - includedSiteCount, 0);
  const extraSitePriceMonthly = invoice.pricingSummary?.extraSitePriceMonthly ?? invoice.extraSitePriceMonthly ?? 5;
  const extraSiteUnitPrice = invoice.pricingSummary?.extraSiteUnitPrice ?? (billingCycle === "annual" ? extraSitePriceMonthly * 12 : extraSitePriceMonthly);
  const extraSiteSubtotal = invoice.pricingSummary?.extraSiteSubtotal ?? invoice.extraSiteAmount ?? extraSiteCount * extraSiteUnitPrice;
  const finalTotal = invoice.pricingSummary?.finalTotal ?? invoice.total ?? invoice.price;
  const basePrice = invoice.pricingSummary?.basePrice ?? invoice.basePrice ?? Math.max(finalTotal - extraSiteSubtotal, 0);

  return {
    billingCycleLabel,
    billingUnit,
    selectedWebsiteCount,
    includedSiteCount,
    websiteCapacity,
    extraSiteCount,
    extraSiteUnitPrice,
    extraSiteSubtotal,
    basePrice,
    finalTotal,
    subtotal: invoice.pricingSummary?.subtotal ?? invoice.subtotal ?? basePrice + extraSiteSubtotal,
  };
}

function DetailMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}

export function InvoiceCard({
  invoice, onDownload, onNew, onViewInvoices,
}: {
  invoice: Invoice;
  onDownload?: () => void;
  onNew?: () => void;
  onViewInvoices?: () => void;
}) {
  const items = invoice.items?.length ? invoice.items : [{
    websiteId: invoice.subscription.websiteId ?? "site",
    websiteName: invoice.subscription.planName,
    websiteDomain: "",
    planName: invoice.subscription.planName,
    billingCycle: invoice.subscription.planType,
    price: invoice.price,
    currency: invoice.currency,
    activationStatus: invoice.status === "Completed" ? "Active" as const : "Pending" as const,
  }];
  const summary = getInvoiceSummary(invoice);
  const lineItems = invoice.lineItems?.length ? invoice.lineItems : [
    {
      description: `${invoice.subscription.planName} Plan - ${summary.billingCycleLabel}`,
      details: `Includes ${summary.includedSiteCount} websites`,
      quantity: 1,
      unitPrice: summary.basePrice,
      amount: summary.basePrice,
      currency: invoice.currency,
      type: "plan" as const,
    },
    ...(summary.extraSiteCount > 0 ? [{
      description: "Additional websites",
      details: `${summary.extraSiteCount} extra websites x ${formatMoney(invoice.currency, summary.extraSiteUnitPrice)} / ${summary.billingUnit}`,
      quantity: summary.extraSiteCount,
      unitPrice: summary.extraSiteUnitPrice,
      amount: summary.extraSiteSubtotal,
      currency: invoice.currency,
      type: "extra_websites" as const,
    }] : []),
    {
      description: "Selected websites",
      details: items.map((item) => item.websiteName).join(", "),
      quantity: items.length,
      unitPrice: 0,
      amount: 0,
      currency: invoice.currency,
      type: "selected_websites" as const,
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/30 p-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Invoice</p>
          <h3 className="font-display text-2xl font-semibold">{invoice.id}</h3>
          <p className="text-xs text-muted-foreground">Issued {new Date(invoice.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <img src={mainLogo} alt="Flooring Intel" className="h-8 w-auto" />
          <StatusBadge status={invoice.status} />
        </div>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-2">
        {invoice.sellerBillingInfo && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">From / Seller</p>
            <p className="mt-2 font-medium">{invoice.sellerBillingInfo.companyName}</p>
            <p className="text-sm text-muted-foreground">{invoice.sellerBillingInfo.billingEmail}</p>
            <p className="text-sm text-muted-foreground">{invoice.sellerBillingInfo.phone}</p>
            <p className="text-sm text-muted-foreground">{invoice.sellerBillingInfo.addressLine1}</p>
          </div>
        )}
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Bill to</p>
          <p className="mt-2 font-medium">{invoice.billTo.fullName}</p>
          {invoice.billTo.company && <p className="text-sm text-muted-foreground">{invoice.billTo.company}</p>}
          <p className="text-sm text-muted-foreground">{invoice.billTo.email}</p>
          {invoice.billTo.address && <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.billTo.address}</p>}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Payment</p>
          <p className="mt-2 font-medium">Stripe</p>
          <p className="text-sm text-muted-foreground">Currency: {invoice.currency}</p>
          {invoice.stripeSubscriptionId && (
            <p className="text-sm text-muted-foreground">Stripe subscription: {invoice.stripeSubscriptionId}</p>
          )}
          {invoice.stripeStatus && (
            <p className="text-sm text-muted-foreground">Stripe status: {invoice.stripeStatus}</p>
          )}
        </div>
      </div>

      <div className="border-t border-border p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Subscription details</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailMetric label="Included websites" value={summary.includedSiteCount} />
          <DetailMetric label="Selected websites" value={summary.selectedWebsiteCount} />
          <DetailMetric label="Website capacity" value={summary.websiteCapacity} />
          <DetailMetric label="Additional websites" value={summary.extraSiteCount} />
        </div>
      </div>

      <div className="border-t border-border p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Line items</p>
        <div className="mt-3 space-y-3">
          {lineItems.map((item) => (
            <div key={`${item.type}-${item.description}`} className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-[1fr_auto_auto_auto] md:items-start">
              <div>
                <p className="font-medium">{item.description}</p>
                {item.details && <p className="text-sm text-muted-foreground">{item.details}</p>}
              </div>
              <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
              <p className="text-sm text-muted-foreground">{formatMoney(item.currency, item.unitPrice)}</p>
              <p className="font-medium">{formatMoney(item.currency, item.amount)}</p>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <p className="text-sm text-muted-foreground">Subtotal</p>
            <p className="font-medium">{formatMoney(invoice.currency, summary.subtotal)}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">{summary.billingCycleLabel} total</p>
            <p className="font-display text-2xl font-semibold">{formatMoney(invoice.currency, summary.finalTotal)}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-border p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Selected websites</p>
        <div className="mt-3 space-y-3">
          {items.map((item) => (
            <div key={item.websiteId} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3">
              <div>
                <p className="font-medium">{item.websiteName}</p>
                <p className="text-sm text-muted-foreground">{item.websiteDomain}</p>
              </div>
              <StatusBadge status={item.activationStatus === "Active" ? "Active" : "Pending Activation"} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border p-6">
        {onNew && <Button variant="ghost" onClick={onNew}>New invoice</Button>}
        {onViewInvoices && <Button variant="outline" onClick={onViewInvoices}><ListChecks className="mr-2 h-4 w-4" /> View My Invoices</Button>}
        {onDownload && (
          <Button variant="outline" onClick={onDownload}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
        )}
      </div>
    </Card>
  );
}
