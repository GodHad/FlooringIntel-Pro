import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/DashboardLayout";

export const Route = createFileRoute("/dashboard/subscriptions/cancel")({
  head: () => ({ meta: [{ title: "Checkout Cancelled - FlooringIntel" }] }),
  component: SubscriptionCancelPage,
});

function SubscriptionCancelPage() {
  return (
    <div>
      <PageHeader title="Checkout cancelled" description="Your Stripe checkout was cancelled." />
      <Card className="p-6">
        <p className="font-display text-2xl font-semibold">No payment was completed</p>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          You can return to the subscriptions page and start a new checkout whenever you are ready.
        </p>
        <Button asChild className="mt-5">
          <Link to="/dashboard/subscriptions">Back to Subscriptions</Link>
        </Button>
      </Card>
    </div>
  );
}
