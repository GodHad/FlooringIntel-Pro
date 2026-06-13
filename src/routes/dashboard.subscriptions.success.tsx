import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/DashboardLayout";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/subscriptions/success")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Payment Received - FlooringIntel" }] }),
  component: SubscriptionSuccessPage,
});

function SubscriptionSuccessPage() {
  return (
    <div>
      <PageHeader title="Payment received" description="Stripe checkout was completed successfully." />
      <Card className="p-6">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <p className="mt-4 font-display text-2xl font-semibold">We are confirming your subscription</p>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Your plan will activate automatically once Stripe confirms the payment through the backend webhook.
        </p>
        <Button asChild className="mt-5">
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
      </Card>
    </div>
  );
}
