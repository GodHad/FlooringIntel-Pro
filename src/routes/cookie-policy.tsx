import { Logo } from "@/components/Logo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/cookie-policy")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — FlooringIntel" },
      { name: "description", content: "How FlooringIntel uses cookies and similar technologies to operate and improve the platform." },
      { property: "og:title", content: "Cookie Policy — FlooringIntel" },
      { property: "og:description", content: "How FlooringIntel uses cookies and similar technologies." },
      { property: "og:url", content: "https://flooringintel.onrender.com/cookie-policy" },
    ],
    links: [{ rel: "canonical", href: "https://flooringintel.onrender.com/cookie-policy" }],
  }),
  component: CookiePolicyPage,
});

function CookiePolicyPage() {
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
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Cookie Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: May 25, 2026</p>

        <div className="prose prose-neutral mt-10 max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold">1. What are cookies?</h2>
            <p className="mt-2 text-muted-foreground">
              Cookies are small text files stored on your device when you visit a website. They help sites remember your
              preferences, keep you signed in, and understand how the platform is used.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">2. How FlooringIntel uses cookies</h2>
            <p className="mt-2 text-muted-foreground">
              We use cookies and similar technologies for essential functionality (such as authentication and session
              management), to remember your preferences (such as report cadence), and to measure aggregate usage so we can
              improve the product.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">3. Categories of cookies</h2>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
              <li><strong>Strictly necessary:</strong> Required to operate the site, keep you signed in, and secure your session.</li>
              <li><strong>Preferences:</strong> Remember your settings such as theme, dashboard layout, and report frequency.</li>
              <li><strong>Analytics:</strong> Help us understand which features are used so we can prioritize improvements.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold">4. Managing cookies</h2>
            <p className="mt-2 text-muted-foreground">
              You can accept or reject non-essential cookies using the cookie banner shown on your first visit. You can
              also clear cookies through your browser settings at any time. Disabling strictly necessary cookies may
              prevent parts of FlooringIntel from working correctly.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">5. Third-party cookies</h2>
            <p className="mt-2 text-muted-foreground">
              We may use trusted third-party services for analytics and infrastructure. These providers may set their
              own cookies subject to their respective privacy policies.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">6. Changes to this policy</h2>
            <p className="mt-2 text-muted-foreground">
              We may update this Cookie Policy from time to time. Material changes will be reflected by updating the
              "Last updated" date above.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">7. Contact</h2>
            <p className="mt-2 text-muted-foreground">
              Questions about this policy? Contact <a className="text-primary underline" href="mailto:cookies941217@gmail.com">Support</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-border pt-6 text-sm">
          <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div className="flex gap-4">
            <Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
