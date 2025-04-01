import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  Download,
  Globe2,
  LayoutDashboard,
  PackageMinus,
  PackagePlus,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import favicon from "@/assets/favicon.png";

const SITE_URL = "https://flooringintel.onrender.com";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About FlooringIntel | Flooring Product Intelligence" },
      { name: "description", content: "FlooringIntel helps flooring retailers monitor supplier websites, track product changes, receive reports, and export clean product data." },
      { name: "keywords", content: "FlooringIntel, flooring product intelligence, flooring product tracking, supplier website monitoring, flooring data platform" },
      { property: "og:title", content: "About FlooringIntel" },
      { property: "og:description", content: "FlooringIntel helps flooring retailers track supplier product changes from one dashboard." },
      { property: "og:url", content: `${SITE_URL}/about` },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "About FlooringIntel" },
      { name: "twitter:description", content: "FlooringIntel helps flooring retailers track supplier product changes from one dashboard." },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/about` },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About FlooringIntel",
          url: `${SITE_URL}/about`,
          about: {
            "@type": "SoftwareApplication",
            name: "FlooringIntel",
            applicationCategory: "BusinessApplication",
            description: "A product intelligence platform for flooring retailers that tracks product changes across supplier websites.",
          },
        }),
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <a href="/#changes" className="hover:text-foreground">Features</a>
            <a href="/#cta" className="hover:text-foreground">Pricing</a>
            <Link to="/about" className="text-foreground">About</Link>
            <Link to="/login" className="hover:text-foreground">Login</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/register"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-secondary)_0%,_transparent_60%)]" />
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Activity className="h-3.5 w-3.5" /> Flooring product intelligence
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground lg:text-6xl">
            About FlooringIntel
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            FlooringIntel helps flooring retailers monitor supplier websites, track product changes, and turn market movement into clear daily action.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Instead of manually checking brand catalogs, teams can review new products, removed items, availability changes, product badges, and exportable product data from one focused dashboard.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="gap-2">Start Using FlooringIntel <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <a href="mailto:cookies941217@gmail.com">
              <Button size="lg" variant="outline">Contact Support</Button>
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Our purpose</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">Why FlooringIntel Exists</h2>
            <p className="mt-4 text-muted-foreground">
              Flooring retailers often need to check many supplier websites to understand what products are new, removed, updated, or worth watching. That process is slow, repetitive, and easy to miss.
            </p>
            <p className="mt-3 text-muted-foreground">
              FlooringIntel makes supplier product monitoring easier by collecting product changes into one dashboard, sending useful reports, and giving teams clean exports for merchandising and sales workflows.
            </p>
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {[
              "Track supplier website product changes",
              "Find new and removed products",
              "See product badges such as New Arrival, Coming Soon, Discontinued, and Discounted",
              "Export product data to Excel",
              "Request tracking for new supplier websites",
              "Subscribe to product update reports",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Platform</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">What FlooringIntel Does</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Feature icon={<Activity />} title="Product Change Tracking" desc="Monitor flooring supplier websites and identify product changes over time." />
            <Feature icon={<PackagePlus />} title="New and Removed Products" desc="See which products were added or removed from supplier websites." />
            <Feature icon={<Tag />} title="Product Badges" desc="Display important product labels like New Arrival, Coming Soon, Discontinued, and Discounted when available." />
            <Feature icon={<Download />} title="Excel Exports" desc="Download clean product data for internal review, merchandising, or sales workflows." />
            <Feature icon={<Globe2 />} title="Website Tracking Requests" desc="Request new supplier websites to be tracked." />
            <Feature icon={<Bell />} title="Daily and Weekly Reports" desc="Receive product updates by email so your team can stay informed." />
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Audience</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">Who FlooringIntel Is For</h2>
            <p className="mt-4 text-muted-foreground">
              FlooringIntel is designed for businesses that need better visibility into flooring supplier product changes.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Flooring retailers",
              "Flooring dealers",
              "Flooring store owners",
              "Ecommerce flooring businesses",
              "Product and merchandising teams",
              "Sales teams",
              "Supplier monitoring teams",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-border bg-card p-4 text-sm">{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Workflow</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">A Practical Way to Monitor the Market</h2>
            <p className="mt-4 text-muted-foreground">
              FlooringIntel focuses on useful data, clear dashboards, reliable exports, and simple subscription-based access. The goal is to help flooring teams act on supplier product information without spending hours checking websites manually.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Feature icon={<Globe2 />} title="Choose websites" desc="Select the supplier websites your team wants to monitor." />
            <Feature icon={<PackagePlus />} title="Review changes" desc="See new products, removed items, and catalog movement in one place." />
            <Feature icon={<LayoutDashboard />} title="Use the dashboard" desc="Filter, search, inspect product details, and compare product activity." />
            <Feature icon={<PackageMinus />} title="Act faster" desc="Update catalogs, brief sales teams, and make assortment decisions with fresher data." />
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 pt-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground lg:p-16">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
                Start tracking flooring product changes today
              </h3>
              <p className="mt-2 max-w-xl text-primary-foreground/80">
                Use FlooringIntel to monitor supplier catalogs, review market movement, and keep your team informed.
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/register"><Button size="lg" variant="secondary">Start free trial</Button></Link>
              <Link to="/dashboard"><Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">View demo</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-start justify-between gap-6 text-sm text-muted-foreground">
            <div className="max-w-sm">
              <Link to="/" className="flex items-center gap-2">
                <img src={favicon} alt="FlooringIntel icon" className="h-8 w-8" />
                <span className="font-display text-lg font-semibold text-foreground">FlooringIntel</span>
              </Link>
              <p className="mt-2">
                FlooringIntel helps flooring retailers monitor supplier product changes, receive reports, and export clean product data.
              </p>
            </div>
            <nav className="flex flex-wrap gap-6" aria-label="Footer">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <Link to="/about" className="hover:text-foreground">About</Link>
              <a href="mailto:cookies941217@gmail.com" className="hover:text-foreground">Contact</a>
              <Link to="/login" className="hover:text-foreground">Login</Link>
              <Link to="/terms" className="hover:text-foreground">Terms</Link>
              <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link to="/cookie-policy" className="hover:text-foreground">Cookie Policy</Link>
            </nav>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">© 2026 FlooringIntel.</p>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <h3 className="mt-4 font-medium">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}
