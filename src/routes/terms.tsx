import { Logo } from "@/components/Logo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — FlooringIntel" },
      { name: "description", content: "The terms governing your use of FlooringIntel's flooring market intelligence platform." },
      { property: "og:title", content: "Terms of Service — FlooringIntel" },
      { property: "og:description", content: "Terms governing your use of the FlooringIntel platform." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Logo />
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm uppercase tracking-wider text-muted-foreground">Legal</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: May 25, 2026</p>

        <div className="prose prose-neutral mt-10 max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="mt-2 text-muted-foreground">
              By accessing or using FlooringIntel ("the Service"), you agree to be bound by these Terms of
              Service. If you do not agree, you may not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. The Service</h2>
            <p className="mt-2 text-muted-foreground">
              FlooringIntel provides flooring retailers with market intelligence reports, including new
              products, removed products, pricing updates, and catalog movement across publicly available
              flooring brand websites. Data is provided for informational purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Accounts</h2>
            <p className="mt-2 text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activities that occur under your account. Notify us immediately of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Subscriptions and Payments</h2>
            <p className="mt-2 text-muted-foreground">
              Paid subscriptions are billed in advance through Stripe checkout. Subscriptions activate after
              Stripe confirms payment and remain active until cancelled. Refunds are handled on a case-by-case basis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Acceptable Use</h2>
            <p className="mt-2 text-muted-foreground">
              You agree not to resell, redistribute, or republish data from the Service without written
              permission. You may not attempt to reverse-engineer, scrape, or disrupt the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Data Accuracy</h2>
            <p className="mt-2 text-muted-foreground">
              While we strive for accuracy, FlooringIntel does not guarantee that all product, pricing, or
              catalog data is complete or free from errors. You should independently verify information
              before making business decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Intellectual Property</h2>
            <p className="mt-2 text-muted-foreground">
              The FlooringIntel platform, brand, and aggregated reports are the property of FlooringIntel.
              Brand names referenced belong to their respective owners and are used for identification only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Termination</h2>
            <p className="mt-2 text-muted-foreground">
              We may suspend or terminate your access at any time for violation of these Terms. You may
              cancel your account at any time from your dashboard settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Limitation of Liability</h2>
            <p className="mt-2 text-muted-foreground">
              The Service is provided "as is" without warranties of any kind. FlooringIntel shall not be
              liable for any indirect, incidental, or consequential damages arising from use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">10. Changes to Terms</h2>
            <p className="mt-2 text-muted-foreground">
              We may update these Terms from time to time. Continued use of the Service after changes
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">11. Contact</h2>
            <p className="mt-2 text-muted-foreground">
              Questions about these Terms? Contact <a className="text-primary hover:underline" href="mailto:cookies941217@gmail.com">Support</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-border pt-6 text-sm">
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy →</Link>
          <Link to="/" className="text-muted-foreground hover:text-foreground">Back to home</Link>
        </div>
      </main>
    </div>
  );
}
