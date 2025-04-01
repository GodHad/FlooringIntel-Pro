import { Logo } from "@/components/Logo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — FlooringIntel" },
      { name: "description", content: "How FlooringIntel collects, uses, and protects your information." },
      { property: "og:title", content: "Privacy Policy — FlooringIntel" },
      { property: "og:description", content: "How we handle data on the FlooringIntel platform." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: May 25, 2026</p>

        <div className="prose prose-neutral mt-10 max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p className="mt-2 text-muted-foreground">
              This Privacy Policy explains how FlooringIntel ("we", "us") collects, uses, and protects
              information when you use our flooring market intelligence platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Information We Collect</h2>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
              <li><strong>Account information:</strong> name, email address, company, and password.</li>
              <li><strong>Billing information:</strong> billing address and payment method details required to issue invoices.</li>
              <li><strong>Usage data:</strong> pages visited, features used, exports downloaded, and subscriptions selected.</li>
              <li><strong>Communication:</strong> support tickets, email correspondence, and notification preferences.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. How We Use Information</h2>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>To provide, maintain, and improve the Service.</li>
              <li>To process subscriptions, generate invoices, and confirm payments.</li>
              <li>To send daily or weekly intelligence reports and alerts you opted into.</li>
              <li>To respond to support requests and communicate platform updates.</li>
              <li>To detect, prevent, and address fraud or abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Source Data</h2>
            <p className="mt-2 text-muted-foreground">
              FlooringIntel aggregates publicly available product data from flooring brand websites. We do
              not collect personal data from these third-party websites — only product, pricing, and catalog
              information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Sharing of Information</h2>
            <p className="mt-2 text-muted-foreground">
              We do not sell your personal information. We may share data with trusted service providers
              (hosting, payment processing, email delivery) only as needed to operate the Service, or when
              required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Data Retention</h2>
            <p className="mt-2 text-muted-foreground">
              We retain account and billing information while your account is active and as required for
              legal, accounting, or reporting obligations. You may request deletion of your account at any
              time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Security</h2>
            <p className="mt-2 text-muted-foreground">
              We use industry-standard safeguards (encryption in transit, access controls, audit logs) to
              protect your information. No system is completely secure; please use a strong password and
              keep credentials confidential.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Cookies</h2>
            <p className="mt-2 text-muted-foreground">
              We use cookies and similar technologies to keep you signed in, remember preferences, and
              analyze platform usage. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Your Rights</h2>
            <p className="mt-2 text-muted-foreground">
              Depending on your location, you may have rights to access, correct, export, or delete your
              personal information. Contact us to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">10. Changes to This Policy</h2>
            <p className="mt-2 text-muted-foreground">
              We may update this Policy from time to time. Material changes will be communicated by email or
              through the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">11. Contact</h2>
            <p className="mt-2 text-muted-foreground">
              For privacy questions, contact <a className="text-primary hover:underline" href="mailto:cookies941217@gmail.com">Support</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-border pt-6 text-sm">
          <Link to="/terms" className="text-primary hover:underline">Terms of Service →</Link>
          <Link to="/" className="text-muted-foreground hover:text-foreground">Back to home</Link>
        </div>
      </main>
    </div>
  );
}
