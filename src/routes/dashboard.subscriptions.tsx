import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader, StatusBadge } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { authService, subscriptionService, type SubscriptionPlan } from "@/services/api";
import { CheckCircle2, CreditCard, Crown, Mail, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/dashboard/subscriptions")({
  head: () => ({ meta: [{ title: "Subscriptions - FlooringIntel" }] }),
  component: SubscriptionsPage,
});

const EXTRA_SITE_PRICE_MONTHLY = 5;
const EXTRA_SITE_MAX_COUNT = 20;

const getIncludedSiteCount = (plan?: SubscriptionPlan | null) => Number(plan?.websiteLimit || 0);

const getPlanPrice = (plan: SubscriptionPlan, billingCycle: "monthly" | "annual", siteCount: number) => {
  const included = getIncludedSiteCount(plan);
  const extraSites = Math.max(siteCount - included, 0);
  const base = billingCycle === "annual"
    ? Number(plan.annualPrice ?? 0)
    : Number(plan.monthlyPrice ?? plan.price ?? 0);
  return base + (billingCycle === "annual" ? extraSites * EXTRA_SITE_PRICE_MONTHLY * 12 : extraSites * EXTRA_SITE_PRICE_MONTHLY);
};

const getSavings = (plan: SubscriptionPlan, siteCount: number) => {
  const monthlyTotal = getPlanPrice(plan, "monthly", siteCount) * 12;
  const annualTotal = getPlanPrice(plan, "annual", siteCount);
  return Math.max(monthlyTotal - annualTotal, 0);
};

const formatMoney = (value: number) => `$${Math.round(value).toLocaleString()}`;
const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const limitText = (value: number | null, label: string) => (
  value === null ? `Custom ${label}` : `${value} ${label}`
);

function SubscriptionsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { data: user } = useQuery({ queryKey: ["current-user"], queryFn: authService.getCurrentUser });
  const { data: overview } = useQuery({ queryKey: ["subscriptions"], queryFn: subscriptionService.getSubscriptions });
  const plans = overview?.plans ?? [];
  const websites = overview?.websites ?? [];
  const paidPlans = plans.filter((plan) => plan.slug !== "free_trial");
  const [selectedPlanSlug, setSelectedPlanSlug] = useState("pro");
  const selectedPlan = plans.find((plan) => plan.slug === selectedPlanSlug) ?? paidPlans[1] ?? paidPlans[0];
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [planSiteCounts, setPlanSiteCounts] = useState<Record<string, number>>({});
  const getSelectedSiteCount = (plan?: SubscriptionPlan | null) => {
    if (!plan) return 0;
    return planSiteCounts[plan.slug] ?? getIncludedSiteCount(plan);
  };
  const selectedSiteCount = getSelectedSiteCount(selectedPlan);

  const activePaidWebsiteIds = useMemo(() => new Set(
    websites
      .filter((website) => website.proSubscribed || (website.subscription?.status === "active" && website.subscription?.planSlug !== "free_trial"))
      .map((website) => website.id),
  ), [websites]);
  const pendingWebsiteIds = useMemo(() => new Set(
    websites.filter((website) => website.pendingInvoice).map((website) => website.id),
  ), [websites]);
  const currentActiveWebsiteCount = overview?.currentSubscription?.websites?.filter((site) => site.status === "active").length ?? 0;
  const currentSubscriptionCapacity = overview?.currentSubscription?.selectedSiteCount ?? overview?.currentSubscription?.plan?.websiteLimit;
  const remainingWebsiteSlots = currentSubscriptionCapacity === null || currentSubscriptionCapacity === undefined
    ? null
    : Math.max(currentSubscriptionCapacity - currentActiveWebsiteCount, 0);
  const selectedWebsiteNames = websites
    .filter((site) => selectedSites.includes(site.id))
    .map((site) => site.name);
  const selectedOverLimit = selectedSiteCount !== null
    && selectedSiteCount !== undefined
    && selectedSites.length > selectedSiteCount;
  const canAddToCurrentPlan = overview?.currentSubscription?.status === "active"
    && overview.currentSubscription.planSlug === selectedPlan?.slug
    && selectedPlan?.slug !== "free_trial";
  const canAddMoreToCurrentPlan = canAddToCurrentPlan
    && (remainingWebsiteSlots === null || remainingWebsiteSlots > 0);
  const addSelectionOverLimit = canAddToCurrentPlan
    && remainingWebsiteSlots !== null
    && selectedSites.length > remainingWebsiteSlots;

  useEffect(() => {
    if (overview?.currentSubscription?.status === "active" && overview.currentSubscription.planSlug !== "free_trial") {
      setSelectedPlanSlug(overview.currentSubscription.planSlug);
    }
  }, [overview?.currentSubscription?.planSlug, overview?.currentSubscription?.status]);

  if (pathname.startsWith("/dashboard/subscriptions/")) {
    return <Outlet />;
  }

  if (overview?.unlimitedAccess) {
    return (
      <div>
        <PageHeader
          title="Subscriptions"
          description={`${overview.role} accounts have unlimited access and do not use pricing plans.`}
        />
        <Card className="p-6">
          <p className="font-display text-2xl font-semibold">Unlimited access</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This account can view, update, and download products without subscription limits.
          </p>
        </Card>
      </div>
    );
  }

  const toggleSite = (siteId: string) => {
    setSelectedSites((current) => (
      current.includes(siteId)
        ? current.filter((id) => id !== siteId)
        : [...current, siteId]
    ));
  };

  const choosePlan = (plan: SubscriptionPlan) => {
    setSelectedPlanSlug(plan.slug);
  };

  const checkout = async () => {
    if (!selectedPlan) return;
    if (canAddMoreToCurrentPlan) {
      try {
        const result = await subscriptionService.addWebsites(selectedSites);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
          queryClient.invalidateQueries({ queryKey: ["websites"] }),
        ]);
        setSelectedSites([]);
        toast.success(result.addedWebsiteIds.length ? "Websites added to your subscription" : "Selected websites are already included");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to add websites");
      }
      return;
    }
    navigate({
      to: "/dashboard/subscriptions/checkout",
      search: {
        planId: selectedPlan.slug,
        siteIds: selectedSites.join(","),
        billingCycle,
        selectedSiteCount,
      },
    });
  };

  const manageBilling = async () => {
    try {
      const result = await subscriptionService.createStripePortalSession();
      window.location.href = result.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to open Stripe billing portal");
    }
  };

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        description="Choose a plan, select tracked websites, and subscribe securely with Stripe."
      />

      <Card className="mb-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">My subscription</p>
            <h3 className="mt-2 font-display text-2xl font-semibold">
              {overview?.currentSubscription?.plan?.name ?? "Free Trial"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Status: {overview?.currentSubscription?.status ?? "No active plan"} · Billing: {overview?.currentSubscription?.billingCycle ?? "trial"}
            </p>
          </div>
          <StatusBadge status={overview?.currentSubscription?.status ?? "Not active"} />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Metric label="Websites" value={`${overview?.currentSubscription?.websites?.filter((site) => site.status === "active").length ?? 0} / ${overview?.currentSubscription?.selectedSiteCount ?? overview?.currentSubscription?.plan?.websiteLimit ?? "Custom"}`} />
          <Metric label="Exports" value={overview?.downloadLimit === null ? "Unlimited" : `${overview?.remainingDownloads ?? 0} left`} />
          <Metric label="Trial ends" value={overview?.currentSubscription?.trialEndsAt ? new Date(overview.currentSubscription.trialEndsAt).toLocaleDateString() : "-"} />
          <Metric label="Renews / ends" value={overview?.currentSubscription?.nextBillingAt ? new Date(overview.currentSubscription.nextBillingAt).toLocaleDateString() : overview?.currentSubscription?.endsAt ? new Date(overview.currentSubscription.endsAt).toLocaleDateString() : "-"} />
        </div>
        {overview?.currentSubscription?.paymentProvider === "stripe" && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-secondary/30 p-3 text-sm">
            <div>
              <p className="font-medium">Stripe subscription</p>
              <p className="text-muted-foreground">
                {overview.currentSubscription.stripeSubscriptionId || "Subscription ID pending"} · {overview.currentSubscription.stripeStatus || overview.currentSubscription.status}
                {overview.currentSubscription.cancelAtPeriodEnd ? " · Cancels at period end" : ""}
              </p>
            </div>
            {overview.currentSubscription.status === "active" && (
              <Button variant="outline" size="sm" onClick={manageBilling}>Manage billing</Button>
            )}
          </div>
        )}
      </Card>

      <div className="mb-4 flex w-fit rounded-md border border-border bg-background p-1">
        <Button size="sm" variant={billingCycle === "monthly" ? "default" : "ghost"} onClick={() => setBillingCycle("monthly")}>Monthly</Button>
        <Button size="sm" variant={billingCycle === "annual" ? "default" : "ghost"} onClick={() => setBillingCycle("annual")}>Yearly</Button>
      </div>

      <div className="grid gap-4  sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            siteCount={getSelectedSiteCount(plan)}
            onSiteCountChange={(count) => setPlanSiteCounts((current) => ({ ...current, [plan.slug]: count }))}
            selected={selectedPlan?.slug === plan.slug}
            current={overview?.currentSubscription?.planSlug === plan.slug}
            onChoose={() => choosePlan(plan)}
          />
        ))}
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold">Select websites</h3>
              <p className="text-sm text-muted-foreground">
                Selected {selectedSites.length} of {selectedSiteCount || "Custom"} websites for {selectedPlan?.name ?? "selected plan"}.
              </p>
              {!canAddToCurrentPlan && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Not sure which websites to subscribe to now? You can choose them later from this page.
                </p>
              )}
              {canAddToCurrentPlan && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {remainingWebsiteSlots === null
                    ? "You can add more websites to your current plan."
                    : remainingWebsiteSlots > 0
                      ? `You can select ${remainingWebsiteSlots} more ${remainingWebsiteSlots === 1 ? "website" : "websites"} to subscribe in your plan.`
                      : "Your current plan has no remaining website slots."}
                </p>
              )}
              {selectedWebsiteNames.length > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">{selectedWebsiteNames.join(", ")}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedSites([])} disabled={selectedSites.length === 0}>Clear</Button>
              <Button
                onClick={checkout}
                disabled={!selectedPlan || selectedOverLimit || addSelectionOverLimit || selectedSites.length === 0 || (canAddToCurrentPlan && !canAddMoreToCurrentPlan)}
              >
                {canAddMoreToCurrentPlan ? <MessageSquare className="mr-2 h-4 w-4" /> : <CreditCard className="mr-2 h-4 w-4" />}
                {canAddMoreToCurrentPlan ? "Add websites" : canAddToCurrentPlan ? "Plan limit reached" : "Checkout"}
              </Button>
            </div>
          </div>
          {selectedOverLimit && (
            <p className="mt-3 text-sm text-destructive">This checkout includes {selectedSiteCount} website slots.</p>
          )}
          {addSelectionOverLimit && (
            <p className="mt-3 text-sm text-destructive">
              Your current plan has {remainingWebsiteSlots} remaining {remainingWebsiteSlots === 1 ? "website slot" : "website slots"}.
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Select</th>
                <th className="p-3">Website</th>
                {/* <th className="hidden p-3 md:table-cell">Products</th> */}
                <th className="hidden p-3 lg:table-cell">Current access</th>
                <th className="hidden p-3 lg:table-cell">Expires</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {websites.map((website) => {
                const active = activePaidWebsiteIds.has(website.id);
                const trialActive = website.subscription?.status === "active" && website.subscription?.planSlug === "free_trial";
                const pending = pendingWebsiteIds.has(website.id);
                const disabled = active || pending;
                return (
                  <tr key={website.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <Checkbox checked={selectedSites.includes(website.id)} disabled={disabled} onCheckedChange={() => toggleSite(website.id)} />
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{website.name}</p>
                      <p className="text-xs text-muted-foreground">{website.domain}</p>
                    </td>
                    {/* <td className="hidden p-3 text-muted-foreground md:table-cell">{website.productCount.toLocaleString()}</td> */}
                    <td className="hidden p-3 text-muted-foreground lg:table-cell">{website.subscription?.planType ?? "-"}</td>
                    <td className="hidden p-3 text-muted-foreground lg:table-cell">{formatDate(website.subscription?.expirationDate)}</td>
                    <td className="p-3">
                      {active ? (
                        <StatusBadge status="Active" />
                      ) : trialActive ? (
                        <StatusBadge status="Free Trial" />
                      ) : pending ? (
                        <StatusBadge status={website.pendingInvoice?.status ?? "Pending Stripe Checkout"} />
                      ) : (
                        <StatusBadge status="Available" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <div className="flex items-start gap-3">
          <Mail className="mt-1 h-5 w-5 text-primary" />
          <div>
            <h3 className="font-display text-lg font-semibold">Email alerts</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Email alerts can be enabled only for websites in an active or trialing subscription. Expired website alerts are disabled automatically.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PlanCard({
  plan,
  billingCycle,
  siteCount,
  onSiteCountChange,
  selected,
  current,
  onChoose,
}: {
  plan: SubscriptionPlan;
  billingCycle: "monthly" | "annual";
  siteCount: number;
  onSiteCountChange: (count: number) => void;
  selected: boolean;
  current: boolean;
  onChoose: () => void;
}) {
  const cta = plan.slug === "free_trial"
    ? "Start Free Trial"
    : `Choose ${plan.name}`;

  const includedSiteCount = getIncludedSiteCount(plan);
  const showSiteSelector = ["starter", "pro"].includes(plan.slug);
  const total = getPlanPrice(plan, billingCycle, siteCount);
  const displayPrice = billingCycle === "annual" ? total / 12 : total;
  const savings = billingCycle === "annual" ? getSavings(plan, siteCount) : 0;
  const siteOptions = Array.from({ length: EXTRA_SITE_MAX_COUNT + 1 }, (_, index) => includedSiteCount + index);

  return (
    <Card className={`flex flex-col rounded-lg p-6 shadow-sm ${selected ? "border-primary ring-1 ring-primary" : "border-border"}`}>
      <div className="flex min-h-[84px] items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl font-semibold">{plan.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{plan.description || (plan.slug === "free_trial" ? "Try FlooringIntel with limited access." : "Monitor flooring sites with automated product intelligence.")}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {plan.slug === "pro" && <Badge><Crown className="mr-1 h-3 w-3" /> Most Popular</Badge>}
          {current && <Badge variant="secondary">Current</Badge>}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-end gap-1">
          <span className="font-display text-4xl font-semibold tracking-tight">
            {plan.monthlyPrice === null && plan.price === null ? "Custom" : formatMoney(displayPrice)}
          </span>
          {plan.monthlyPrice !== null && plan.price !== null && (
            <span className="pb-1 text-sm text-muted-foreground">/ month</span>
          )}
        </div>
        {billingCycle === "annual" && plan.monthlyPrice !== null && plan.price !== null && (
          <p className="mt-2 text-sm text-muted-foreground">Annual pay {plan.currency} {total.toFixed(2)}</p>
        )}
        {savings > 0 && <Badge variant="secondary" className="mt-2">Save ${savings}</Badge>}
        <p className="mt-2 text-sm text-muted-foreground">for {siteCount || includedSiteCount} sites</p>
      </div>

      <Button className="mt-5" variant={selected ? "default" : "outline"} onClick={onChoose} disabled={current}>
        {current ? "Current Plan" : cta}
      </Button>

      {showSiteSelector && (
        <div className="mt-5 space-y-2">
          <p className="text-sm font-medium">Tracked sites</p>
          <Select value={String(siteCount)} onValueChange={(value) => onSiteCountChange(Number(value))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {siteOptions.map((count) => {
                const extra = Math.max(count - includedSiteCount, 0);
                return (
                  <SelectItem key={count} value={String(count)}>
                    {count} {count === 1 ? "site" : "sites"} {extra === 0 ? "included" : `(+${extra * EXTRA_SITE_PRICE_MONTHLY}/mo)`}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Includes {includedSiteCount} sites. Add more sites for $5/month each.
          </p>
        </div>
      )}

      <div className="mt-5 space-y-1 text-sm text-muted-foreground">
        <p>{limitText(plan.userLimit, "users")}</p>
        <p>{plan.exportLimit === null ? "Unlimited exports" : `${plan.exportLimit} exports`}</p>
      </div>
      <ul className="mt-4 flex-1 space-y-2 text-sm">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
