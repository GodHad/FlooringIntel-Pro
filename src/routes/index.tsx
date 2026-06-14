import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Globe2, LayoutDashboard, FileSpreadsheet, MailPlus, Activity,
  ArrowRight, CheckCircle2, Sparkles, Database, Bell, Tag, PackagePlus, PackageMinus,
  Layers, MessageSquare, Building2, Palette, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type PublicWeeklyReport } from "@/services/api";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import ogImage from "@/assets/og-flooringintel.jpg";
import { Logo } from "@/components/Logo";
import favicon from "@/assets/favicon.png";

const SITE_URL = "https://flooringintel.onrender.com";
const OG_IMAGE = `${SITE_URL}${ogImage}`;

const FAQS = [
  { q: "What is FlooringIntel?", a: "FlooringIntel by Dezigned is a product-change intelligence platform for the flooring and design industries. It monitors supplier catalogs and reports new, removed, and updated products in one dashboard." },
  { q: "What does \"by Dezigned\" mean?", a: "FlooringIntel is a Dezigned product. Dezigned builds practical technology for design and flooring professionals, focused on convenience, profitability, and efficiency. FlooringIntel extends that mission into product-change monitoring." },
  { q: "Which brands can FlooringIntel track?", a: "FlooringIntel tracks leading flooring, carpet, and rug brands such as Shaw Floors, Mohawk, Masland, Anderson Tuftex, Fabrica, Dixie, Nourison, Kaleen, Couristan, Prestige, Fibreworks, and more by request." },
  { q: "Can I export product data?", a: "Yes. FlooringIntel lets users export product data and product changes to Excel for analysis, reporting, catalog updates, and team workflows." },
  { q: "How often is product data updated?", a: "FlooringIntel is designed for daily monitoring, with daily or weekly email reports depending on user preferences." },
  { q: "Who is FlooringIntel built for?", a: "Flooring retailers, showrooms, interior designers, trade professionals, product managers, sales and operations teams, and distributors." },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlooringIntel by Dezigned | Product Change Intelligence for Flooring" },
      { name: "description", content: "FlooringIntel by Dezigned helps flooring retailers, designers, showrooms, and trade teams monitor supplier catalogs, track new and discontinued products, and turn product changes into clear, useful reports." },
      { property: "og:title", content: "FlooringIntel by Dezigned" },
      { property: "og:description", content: "Product change intelligence for flooring and design professionals. A Dezigned product." },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:title", content: "FlooringIntel by Dezigned" },
      { name: "twitter:description", content: "Track flooring product changes with the clarity of Dezigned technology." },
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
          description: "FlooringIntel by Dezigned helps flooring and design teams monitor supplier catalogs and track product changes across brands.",
          url: `${SITE_URL}/`,
          brand: { "@type": "Brand", name: "Dezigned" },
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

const CATEGORIES = [
  "Carpet", "Rugs", "Luxury Vinyl", "Hardwood", "Laminate",
  "Tile", "Stone", "Sheet Vinyl", "Commercial Flooring", "Accessories",
];

function Landing() {
  const report = fallbackWeeklyReport;
  const reportRows = report.rows;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#solution" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#audience" className="hover:text-foreground">Who it's for</a>
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/login" className="hover:text-foreground">Login</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/register"><Button size="sm">Request a Demo</Button></Link>
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
              A Dezigned product
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground lg:text-6xl">
              Product change intelligence for flooring and design professionals.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              FlooringIntel by Dezigned helps flooring retailers, designers, showrooms, and trade
              teams monitor supplier catalogs, track new and discontinued products, and turn
              product changes into clear, useful reports.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg" className="gap-2">Request a Demo <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline">View Dashboard</Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="ghost">Track a Brand</Button>
              </Link>
            </div>
            <p className="mt-6 max-w-xl text-sm text-muted-foreground">
              A Dezigned product built to bring more clarity, control, and efficiency to flooring product workflows.
            </p>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={favicon} alt="FlooringIntel" className="h-8 w-8" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">This week's report</p>
                    <p className="font-display text-2xl font-semibold">Market movement</p>
                  </div>
                </div>
                <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                  Live
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <StatTile label="New products" value={formatSignedCount(report.stats.newProducts, "+")} />
                <StatTile label="Removed products" value={formatSignedCount(report.stats.removedProducts, "-")} />
                <StatTile label="Catalog updates" value={report.stats.catalogUpdates.toLocaleString()} />
                <StatTile label="Brands tracked" value={`${report.stats.brandsTracked.toLocaleString()}+`} />
              </div>
              <div className="mt-6 flex flex-wrap gap-1.5">
                {["Carpet", "Hardwood", "LVT", "Tile", "Rugs", "Stone"].map((c) => (
                  <span key={c} className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground">
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-4 space-y-2">
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
            <div className="absolute -right-4 -top-4 hidden h-24 w-24 rounded-full bg-destructive/20 blur-2xl lg:block" />
            <div className="absolute -bottom-6 -left-6 hidden h-32 w-32 rounded-full bg-accent/30 blur-3xl lg:block" />
          </div>
        </div>
      </section>

      {/* Dezigned ownership strip */}
      <section className="border-y border-border bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-destructive text-destructive-foreground font-display text-lg font-bold">D</span>
            <div>
              <p className="font-display text-lg font-semibold">Now powered by Dezigned.</p>
              <p className="text-sm text-background/70">
                FlooringIntel is now part of Dezigned's mission to bring better technology, organization, and efficiency to the design and flooring industries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-destructive">The problem</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              Supplier catalogs change constantly. Your team should not have to check them manually.
            </h2>
            <p className="mt-4 text-muted-foreground">
              New products appear. Colors disappear. Collections change. Items get discontinued. Availability and product badges shift without warning. FlooringIntel helps teams keep up with those changes without manually visiting every supplier website.
            </p>
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Too many supplier websites to monitor manually",
              "Product changes are easy to miss",
              "Discontinued products can create quoting and showroom issues",
              "Designers and sales teams need accurate product information",
              "Manual tracking wastes time",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="border-t border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">The solution</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              A better way to monitor flooring product changes.
            </h2>
            <p className="mt-4 text-muted-foreground">
              FlooringIntel scans supplier catalogs, organizes product changes, and gives your team a clear view of what changed, where it changed, and why it matters.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Feature icon={<PackagePlus />} title="New product tracking" desc="Catch every newly added SKU as it lands on supplier sites." />
            <Feature icon={<PackageMinus />} title="Removed and discontinued" desc="See what's been pulled before it shows up in a quote." />
            <Feature icon={<Tag />} title="Badges and availability" desc="Track New, Coming Soon, Discontinued, and stock changes." />
            <Feature icon={<Layers />} title="Category and collection" desc="Detect when collections launch, rename, or retire." />
            <Feature icon={<MailPlus />} title="Daily and weekly email reports" desc="Digest summaries delivered to your team on your schedule." />
            <Feature icon={<MessageSquare />} title="Slack reporting" desc="Pipe product changes into the channels your team already uses." />
            <Feature icon={<Globe2 />} title="Brand and website tracking" desc="Request the brands and supplier websites you care about." />
            <Feature icon={<FileSpreadsheet />} title="Exportable product data" desc="Clean Excel exports for merchandising and sales workflows." />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">How it works</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              From supplier websites to clear product-change reports.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {[
              { n: "01", t: "Choose the brands or websites you want to monitor", i: <Globe2 className="h-5 w-5" /> },
              { n: "02", t: "FlooringIntel scans product catalogs", i: <Database className="h-5 w-5" /> },
              { n: "03", t: "Product data is normalized by category, collection, color, and attributes", i: <Layers className="h-5 w-5" /> },
              { n: "04", t: "Changes are detected and organized", i: <Activity className="h-5 w-5" /> },
              { n: "05", t: "Your team reviews updates or receives digest reports", i: <Bell className="h-5 w-5" /> },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 text-primary">
                  {s.i}<span className="text-xs font-semibold tracking-wider text-muted-foreground">STEP {s.n}</span>
                </div>
                <p className="mt-4 text-sm font-medium leading-snug">{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it helps */}
      <section id="audience" className="border-t border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Who it helps</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              Built for the people who work with flooring products every day.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Whether your team sells flooring, specifies products, manages showroom displays, or supports trade clients, FlooringIntel helps keep product information easier to track and act on.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Flooring retailers", i: <Building2 className="h-5 w-5" /> },
              { t: "Showrooms", i: <LayoutDashboard className="h-5 w-5" /> },
              { t: "Interior designers", i: <Palette className="h-5 w-5" /> },
              { t: "Trade professionals", i: <Users className="h-5 w-5" /> },
              { t: "Product managers", i: <Tag className="h-5 w-5" /> },
              { t: "Sales teams", i: <Activity className="h-5 w-5" /> },
              { t: "Operations teams", i: <Database className="h-5 w-5" /> },
              { t: "Distributors", i: <Globe2 className="h-5 w-5" /> },
            ].map((a) => (
              <div key={a.t} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">{a.i}</span>
                <span className="font-medium">{a.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Categories</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              Designed for real flooring categories.
            </h2>
            <p className="mt-4 text-muted-foreground">
              FlooringIntel is built around the way flooring products are actually organized, including category-specific attributes like wear layer, fiber type, backing, tile material, stone type, installation method, and more.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <span key={c} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Dezigned alignment */}
      <section className="border-t border-border bg-foreground py-20 text-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-destructive">Dezigned alignment</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              Built with Dezigned's "better way" mindset.
            </h2>
            <p className="mt-4 text-background/80">
              Dezigned believes technology should bring order, efficiency, and profitability to the design and trade industries. FlooringIntel extends that mindset into product tracking, helping teams spend less time chasing supplier updates and more time serving clients.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { t: "Clarity", d: "Clear views of what changed and why it matters." },
              { t: "Control", d: "Pick the brands, categories, and reports that fit your team." },
              { t: "Efficiency", d: "Replace manual website checks with organized digests." },
              { t: "Profitability", d: "Catch discontinued items before they affect quotes or sales." },
            ].map((v) => (
              <div key={v.t} className="rounded-2xl border border-background/15 bg-background/5 p-5">
                <p className="font-display text-lg font-semibold">{v.t}</p>
                <p className="mt-1 text-sm text-background/70">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reports */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Reports</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              Reports your team can actually use.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Instead of long spreadsheets or scattered website checks, FlooringIntel turns product changes into simple daily and weekly summaries.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "New products", "Removed products", "Updated products", "Brand activity",
              "Category activity", "Product badges", "Availability changes", "Source website links",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{item}</span>
              </div>
            ))}
          </div>
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

      {/* Final CTA */}
      <section id="cta" className="px-6 pb-20 pt-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground lg:p-16">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
                Bring better product visibility to your flooring workflow.
              </h3>
              <p className="mt-2 max-w-xl text-primary-foreground/80">
                See how FlooringIntel by Dezigned can help your team monitor flooring catalogs, reduce manual checking, and stay ahead of product changes.
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/register"><Button size="lg" variant="secondary">Request a Demo</Button></Link>
              <Link to="/dashboard"><Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">View Dashboard</Button></Link>
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
                FlooringIntel by Dezigned — product change intelligence for flooring and design professionals.
              </p>
            </div>
            <nav className="flex flex-wrap gap-6" aria-label="Footer">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <Link to="/about" className="hover:text-foreground">About</Link>
              <a href="/#solution" className="hover:text-foreground">Features</a>
              <a href="/#cta" className="hover:text-foreground">Pricing</a>
              <a href="mailto:cookies941217@gmail.com" className="hover:text-foreground">Contact</a>
              <Link to="/login" className="hover:text-foreground">Login</Link>
              <Link to="/terms" className="hover:text-foreground">Terms</Link>
              <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link to="/cookie-policy" className="hover:text-foreground">Cookie Policy</Link>
            </nav>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">© 2026 FlooringIntel · A Dezigned product.</p>
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
    brandsTracked: 15,
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
