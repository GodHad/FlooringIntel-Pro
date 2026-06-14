import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity, ArrowRight, CheckCircle2, Globe2, LayoutDashboard,
  PackageMinus, PackagePlus, Tag, Palette, Building2, Users, Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import favicon from "@/assets/favicon.png";

const SITE_URL = "https://flooringintel.onrender.com";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About FlooringIntel | A Dezigned product" },
      { name: "description", content: "FlooringIntel is a product-change intelligence platform for the flooring and design industries, now powered by Dezigned." },
      { name: "keywords", content: "FlooringIntel, Dezigned, flooring product intelligence, supplier catalog monitoring, flooring data platform" },
      { property: "og:title", content: "About FlooringIntel by Dezigned" },
      { property: "og:description", content: "A Dezigned product built for flooring product intelligence." },
      { property: "og:url", content: `${SITE_URL}/about` },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "About FlooringIntel by Dezigned" },
      { name: "twitter:description", content: "A Dezigned product built for flooring product intelligence." },
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
            brand: { "@type": "Brand", name: "Dezigned" },
            description: "A product-change intelligence platform for the flooring and design industries, powered by Dezigned.",
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
            <a href="/#solution" className="hover:text-foreground">Features</a>
            <a href="/#how" className="hover:text-foreground">How it works</a>
            <Link to="/about" className="text-foreground">About</Link>
            <Link to="/login" className="hover:text-foreground">Login</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/register"><Button size="sm">Request a Demo</Button></Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-secondary)_0%,_transparent_60%)]" />
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Activity className="h-3.5 w-3.5" /> A Dezigned product
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground lg:text-6xl">
            About FlooringIntel
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A Dezigned product built for flooring product intelligence.
          </p>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            FlooringIntel is a product-change intelligence platform for the flooring and design industries. Now powered by Dezigned, FlooringIntel helps retailers, designers, showrooms, and trade teams monitor supplier catalogs, track product changes, and turn scattered updates into clear, actionable reports.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="gap-2">Request a Demo <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <a href="mailto:cookies941217@gmail.com">
              <Button size="lg" variant="outline">Contact Support</Button>
            </a>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Our mission</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              Clarity, control, and efficiency for flooring product workflows.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our mission is to bring more clarity, control, and efficiency to flooring product workflows. Supplier catalogs change constantly, and those changes affect quoting, product recommendations, showroom displays, client conversations, and purchasing decisions. FlooringIntel helps teams stay informed without manually checking every brand website.
            </p>
          </div>
        </div>
      </section>

      {/* Why Dezigned */}
      <section className="border-t border-border bg-foreground py-20 text-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-5 lg:items-center">
          <div className="lg:col-span-2">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-destructive text-destructive-foreground font-display text-2xl font-bold">D</span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-destructive">Why Dezigned</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              A better way of working in design and flooring.
            </h2>
          </div>
          <div className="lg:col-span-3">
            <p className="text-background/80">
              Dezigned was built around a better way of working in the design and flooring industries. The company focuses on convenience, profitability, efficiency, and technology that supports professionals behind the scenes. FlooringIntel fits directly into that mission by helping teams organize product information, reduce manual work, and respond faster when supplier catalogs change.
            </p>
          </div>
        </div>
      </section>

      {/* What FlooringIntel Tracks */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">What we track</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              What FlooringIntel Tracks
            </h2>
            <p className="mt-4 text-muted-foreground">
              FlooringIntel monitors product catalogs and detects meaningful changes across flooring supplier websites.
            </p>
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "New products",
              "Removed or discontinued products",
              "Product name changes",
              "Collection changes",
              "Category and subcategory changes",
              "Color updates",
              "Availability changes",
              "Product badge changes",
              "Specification changes",
              "Product image changes",
              "Product URL changes",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who it's for */}
      <section className="border-t border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Who it's for</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              Who FlooringIntel Is For
            </h2>
            <p className="mt-4 text-muted-foreground">
              FlooringIntel is for teams that need better product visibility across flooring brands and supplier catalogs.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Feature icon={<Building2 />} title="Retailers" desc="Keep showroom products and pricing aligned with what brands publish." />
            <Feature icon={<Palette />} title="Designers" desc="Check product availability before specifying or presenting to clients." />
            <Feature icon={<Activity />} title="Sales teams" desc="Avoid outdated product recommendations and quoting surprises." />
            <Feature icon={<Tag />} title="Product teams" desc="Monitor brand catalogs and assortment activity in one view." />
            <Feature icon={<Database />} title="Operations teams" desc="Track discontinued products and update internal systems on time." />
            <Feature icon={<Users />} title="Trade professionals" desc="Manage supplier updates across multiple brands and projects." />
          </div>
        </div>
      </section>

      {/* Dezigned ecosystem */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-destructive">Dezigned ecosystem</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
            Part of the Dezigned ecosystem.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Dezigned helps bring technology to the design and flooring industries. FlooringIntel adds product-change monitoring to that ecosystem, giving professionals another way to work with better information, fewer surprises, and more confidence.
          </p>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 pb-20 pt-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground lg:p-16">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
                A better way to stay ahead of flooring product changes.
              </h3>
              <p className="mt-2 max-w-xl text-primary-foreground/80">
                FlooringIntel by Dezigned helps teams know what changed, what matters, and where to take action next.
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

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <h3 className="mt-4 font-medium">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}
