import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatusBadge } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/api";
import { Eye } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin/subscriptions")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Admin Subscriptions - FlooringIntel" }] }),
  component: AdminSubscriptionsPage,
});

function AdminSubscriptionsPage() {
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: adminService.getSubscriptions,
  });

  return (
    <div>
      <PageHeader title="Subscription management" description="Review user plans, tracked websites, invoices, and subscription status." />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Status</th>
                <th className="hidden p-3 md:table-cell">Websites used</th>
                <th className="hidden p-3 lg:table-cell">Invoice ID</th>
                <th className="hidden p-3 xl:table-cell">Started</th>
                <th className="hidden p-3 xl:table-cell">Ends</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading subscriptions...</td></tr>
              )}
              {!isLoading && subscriptions.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No subscriptions yet.</td></tr>
              )}
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-muted/30">
                  <td className="p-3">
                    <p className="font-medium">{subscription.user?.name ?? "Unknown user"}</p>
                    <p className="text-xs text-muted-foreground">{subscription.user?.email}</p>
                  </td>
                  <td className="p-3">{subscription.plan?.name ?? "-"}</td>
                  <td className="p-3"><StatusBadge status={subscription.status} /></td>
                  <td className="hidden p-3 text-muted-foreground md:table-cell">
                    {subscription.websites.filter((site) => site.status === "active").length} / {subscription.plan?.websiteLimit ?? "Custom"}
                  </td>
                  <td className="hidden p-3 text-muted-foreground lg:table-cell">{subscription.invoiceId ?? "-"}</td>
                  <td className="hidden p-3 text-muted-foreground xl:table-cell">{subscription.startsAt ? new Date(subscription.startsAt).toLocaleDateString() : "-"}</td>
                  <td className="hidden p-3 text-muted-foreground xl:table-cell">{subscription.endsAt ? new Date(subscription.endsAt).toLocaleDateString() : subscription.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString() : "-"}</td>
                  <td className="p-3 text-right">
                    {subscription.invoiceId ? (
                      <Link to="/dashboard/admin/invoices">
                        <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    ) : (
                      <Button size="sm" variant="ghost" disabled><Eye className="h-4 w-4" /></Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
