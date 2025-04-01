import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  Globe2, LayoutDashboard, FileSpreadsheet, MailPlus, Activity, TrendingUp,
  ArrowRight, CheckCircle2, Sparkles, Database, Bell, Tag, PackagePlus, PackageMinus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { publicService, type PublicWeeklyReport } from "@/services/api";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import ogImage from "@/assets/og-flooringintel.jpg";
import { Logo } from "@/components/Logo";
import favicon from "@/assets/favicon.png";

const SITE_URL = "https://flooringintel.onrender.com";
const OG_IMAGE = `${SITE_URL}${ogImage}`;

export const Route = createFileRoute("/")({
  // beforeLoad: () => {
  //   throw redirect({ to: "/dashboard" });
  // },
  head: () => ({
    meta: [
      { title: "FlooringIntel | Daily Flooring Product & Competitor Intelligence" },
      { name: "description", content: "FlooringIntel helps flooring retailers track product changes across supplier and competitor websites. Monitor new products, removed items, price updates, catalog changes, and get daily or weekly reports." },
      { property: "og:title", content: "FlooringIntel | Daily Flooring Product Intelligence" },
      { property: "og:description", content: "Track new products, removed items, price changes, and catalog updates across flooring brands in one dashboard." },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:title", content: "FlooringIntel | Daily Flooring Product Intelligence" },
      { name: "twitter:description", content: "Know what changed across flooring brands before your competitors do." },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/` },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "FlooringIntel",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: "FlooringIntel helps flooring retailers monitor product changes across supplier and competitor websites, including new products, removed items, price changes, and catalog updates.",
          url: `${SITE_URL}/`,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            description: "14-day free trial",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Landing,
});

const FAQS = [
  { q: "What is FlooringIntel?", a: "FlooringIntel is a product and competitor intelligence dashboard for flooring retailers. It tracks product changes across flooring brand websites and reports new products, removed items, pricing updates, and catalog movement." },
  { q: "Which brands can FlooringIntel track?", a: "FlooringIntel can track leading flooring, carpet, and rug brands such as Shaw Floors, Mohawk, Masland, Anderson Tuftex, Fabrica, Dixie, Nourison, Kaleen, Couristan, Prestige, Fibreworks, and more by request." },
  { q: "Can I export product data?", a: "Yes. FlooringIntel lets users export product data and product changes to Excel for analysis, reporting, catalog updates, and team workflows." },
  { q: "How often is product data updated?", a: "FlooringIntel is designed for daily monitoring, with daily or weekly email reports depending on user preferences." },
  { q: "Who is FlooringIntel built for?", a: "FlooringIntel is built for flooring retailers, distributors, buyers, ecommerce teams, catalog managers, and product data teams." },
];


const BRANDS = [
  "Masland", "Anderson Tuftex", "Shaw Floors", "Mohawk", "Fabrica", "Dixie",
  "Nourison", "Kaleen", "Couristan", "Prestige", "Fibreworks",
];

function Landing() {
  const weeklyReport = null;
  // const { data: weeklyReport } = useQuery({
  //   queryKey: ["public-weekly-report"],
  //   queryFn: publicService.getWeeklyReport,
  //   refetchInterval: 60000,
  // });
  const report = weeklyReport ?? fallbackWeeklyReport;
  const reportRows = report.rows.length > 0 ? report.rows : fallbackWeeklyReport.rows;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#changes" className="hover:text-foreground">Features</a>
            <a href="#cta" className="hover:text-foreground">Pricing</a>
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/login" className="hover:text-foreground">Login</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/register"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-secondary)_0%,_transparent_60%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Daily intelligence across 10+ flooring brands
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground lg:text-6xl">
              Flooring product changes, tracked daily
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Stop manually checking brand and competitor websites. FlooringIntel gives retailers a
              clean daily or weekly report showing new products, removed items, pricing updates,
              color changes, and catalog movement across the flooring market.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg" className="gap-2">Start free trial <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline">View dashboard demo</Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> No credit card required</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> 14-day trial</span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">This week's report</p>
                  <p className="font-display text-2xl font-semibold">Market movement</p>
                </div>
                <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                  Live
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <StatTile label="New products" value={formatSignedCount(report.stats.newProducts, "+")} />
                <StatTile label="Removed products" value={formatSignedCount(report.stats.removedProducts, "-")} />
                <StatTile label="Catalog updates" value={report.stats.catalogUpdates.toLocaleString()} />
                <StatTile label="Brands tracked" value={`${report.stats.brandsTracked.toLocaleString()}+`} />
              </div>
              <div className="mt-6 space-y-2">
                {reportRows.map((row) => {
                  const meta = getReportRowMeta(row);
                  return (
                  <div key={row.websiteId} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-md bg-secondary text-muted-foreground">
                        {meta.icon}
                      </div>
                      <div>
                        <p className="font-medium">{row.websiteName}</p>
                        <p className="text-xs text-muted-foreground">{meta.summary}</p>
                      </div>
                    </div>
                    <StateBadge tone={meta.tone}>{meta.state}</StateBadge>
                  </div>
                  );
                })}
              </div>
            </div>
            <div className="absolute -right-4 -top-4 hidden h-24 w-24 rounded-full bg-accent/30 blur-2xl lg:block" />
          </div>
        </div>
      </section>

      {/* Brands */}
      <section id="brands" className="border-t border-border bg-secondary/30 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Coverage</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              Track the brands your customers ask about
            </h2>
            <p className="mt-3 text-muted-foreground">
              We monitor leading carpet, rug, and flooring catalogs every day — and we add new brands by request.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {BRANDS.map((b) => (
              <span key={b} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground">
                {b}
              </span>
            ))}
            <span className="rounded-full border border-dashed border-border px-4 py-2 text-sm text-muted-foreground">
              + more on request
            </span>
          </div>
        </div>
      </section>

      {/* What changed */}
      <section id="changes" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">What we report</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              See what changed — without checking every supplier website
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Feature icon={<PackagePlus />} title="New products" desc="Every newly added SKU across tracked brands, with images and full attributes." />
            <Feature icon={<PackageMinus />} title="Removed products" desc="Catch discontinuations early so you can clear inventory or update displays." />
            <Feature icon={<Tag />} title="Price changes" desc="Daily price diffs by product, with before/after and percent change." />
            <Feature icon={<Sparkles />} title="Color & style updates" desc="New colorways, finishes, and style refreshes as soon as they're published." />
            <Feature icon={<LayoutDashboard />} title="Collection changes" desc="Track when collections are launched, renamed, or retired across brands." />
            <Feature icon={<Activity />} title="Availability changes" desc="See what went out of stock, came back, or shifted in lead time." />
          </div>
        </div>
      </section>

      {/* Why retailers */}
      <section className="border-t border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Why retailers use FlooringIntel</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              Make better retail decisions, faster
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Feature icon={<TrendingUp />} title="Spot product gaps" desc="See what brands are pushing — and what's missing from your floor." />
            <Feature icon={<Globe2 />} title="React to competitor moves" desc="Know when nearby competitors' brands shift price or assortment." />
            <Feature icon={<Database />} title="Update your catalog" desc="Keep your website and POS in sync with the latest brand data." />
            <Feature icon={<MailPlus />} title="Prep your sales team" desc="Owners and buyers walk in Monday already knowing what's new." />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">How it works</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              { n: "01", t: "Pick the brands you care about", i: <Globe2 className="h-5 w-5" /> },
              { n: "02", t: "We monitor their catalogs daily", i: <Database className="h-5 w-5" /> },
              { n: "03", t: "Review changes in your dashboard", i: <LayoutDashboard className="h-5 w-5" /> },
              { n: "04", t: "Get daily or weekly email reports", i: <Bell className="h-5 w-5" /> },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 text-primary">
                  {s.i}<span className="text-xs font-semibold tracking-wider text-muted-foreground">STEP {s.n}</span>
                </div>
                <p className="mt-4 font-medium leading-snug">{s.t}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Bell className="h-5 w-5" /></div>
                <h3 className="font-medium">Daily alerts</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Get notified the moment important changes hit — new product drops, price moves on watched SKUs, or discontinuations.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><FileSpreadsheet className="h-5 w-5" /></div>
                <h3 className="font-medium">Weekly owner summary</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                One clean recap each Monday for owners and buyers — what changed, what to act on, exportable to Excel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Hunt friendly */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">For flooring teams</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
            Built for flooring teams that need daily market visibility
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            FlooringIntel helps retailers stop checking supplier websites manually and start acting on product changes faster.
            Track new SKUs, removed products, price changes, and catalog updates from one clean dashboard.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="mt-8">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="px-6 pb-20 pt-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground lg:p-16">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
                Be the most informed retailer on your street
              </h3>
              <p className="mt-2 max-w-xl text-primary-foreground/80">
                Start tracking new products, removed items, and price moves across the brands you sell — in minutes.
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
              <a href="/#changes" className="hover:text-foreground">Features</a>
              <a href="/#cta" className="hover:text-foreground">Pricing</a>
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

const fallbackWeeklyReport: PublicWeeklyReport = {
  weekStart: "",
  generatedAt: "",
  stats: {
    newProducts: 128,
    removedProducts: 34,
    catalogUpdates: 217,
    brandsTracked: 10,
  },
  rows: [
    { websiteId: "new", websiteName: "New products this week", newProducts: 128, removedProducts: 0, catalogUpdates: 0, total: 128, primaryType: "new" },
    { websiteId: "updated", websiteName: "Catalog updates", newProducts: 0, removedProducts: 0, catalogUpdates: 217, total: 217, primaryType: "updated" },
    { websiteId: "removed", websiteName: "Removed products", newProducts: 0, removedProducts: 34, catalogUpdates: 0, total: 34, primaryType: "removed" },
  ],
  latestProducts: [],
};

function formatSignedCount(value: number, sign: "+" | "-") {
  if (!value) return "0";
  return `${sign}${value.toLocaleString()}`;
}

function getReportRowMeta(row: PublicWeeklyReport["rows"][number]) {
  if (row.primaryType === "removed") {
    return {
      icon: <PackageMinus className="h-4 w-4" />,
      tone: "destructive" as const,
      state: "Removed",
      summary: `${row.removedProducts.toLocaleString()} products removed this week`,
    };
  }

  if (row.primaryType === "updated") {
    return {
      icon: <Tag className="h-4 w-4" />,
      tone: "info" as const,
      state: "Updated",
      summary: `${row.catalogUpdates.toLocaleString()} catalog updates this week`,
    };
  }

  return {
    icon: <PackagePlus className="h-4 w-4" />,
    tone: "success" as const,
    state: "New",
    summary: `${row.newProducts.toLocaleString()} new products added this week`,
  };
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-medium">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

function StateBadge({ tone, children }: { tone: "success" | "info" | "destructive"; children: React.ReactNode }) {
  const map = {
    success: "bg-success/10 text-success",
    info: "bg-primary/10 text-primary",
    destructive: "bg-destructive/10 text-destructive",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${map[tone]}`}>{children}</span>;
}
