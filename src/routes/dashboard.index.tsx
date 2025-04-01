import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatusBadge } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authService, productService, scrapingService, ticketService, websiteService } from "@/services/api";
import {
  Package, Globe2, Activity, Sparkles, Bell, Ticket, TrendingUp, ArrowUpRight,
} from "lucide-react";
import { ScrapingJobList } from "@/data/mock";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Overview - FlooringIntel" }] }),
  component: DashboardHome,
});

function DashboardHome() {
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const { data: productResult } = useQuery({
    queryKey: ["products", "overview"],
    queryFn: () => productService.getProducts({ page: 1, pageSize: 10, sortBy: "dateScraped", sortDir: "desc", fromDashboard: true }),
  });
  const { data: weeklyProductResult } = useQuery({
    queryKey: ["products", "new-this-week", weekStart.toISOString()],
    queryFn: () => productService.getProducts({ page: 1, pageSize: 1, addedFrom: weekStart.toISOString(), fromDashboard: true }),
  });
  const defaultScrapingJobs: ScrapingJobList = {
    jobs: [],
    runningCount: 0,
    completeCount: 0,
    failCount: 0,
    scheduleCount: 0,
  };
  const { data: websites = [] } = useQuery({ queryKey: ["websites"], queryFn: () => websiteService.getWebsites() });
  const { data: scrapingJobs = defaultScrapingJobs } = useQuery({ queryKey: ["scraping-jobs"], queryFn: scrapingService.getScrapingJobs });
  const { data: tickets = [] } = useQuery({ queryKey: ["tickets"], queryFn: ticketService.getTickets });
  const { data: user } = useQuery({ queryKey: ["current-user"], queryFn: authService.getCurrentUser });

  const products = productResult?.data ?? [];
  const totalProducts = productResult?.total ?? 0;
  const newThisWeek = weeklyProductResult?.total ?? 0;
  const completedJobs = scrapingJobs.jobs.filter((j) => j.status === "Completed").length;
  const failedJobs = scrapingJobs.jobs.filter((j) => j.status === "Failed").length;
  const runningJobs = scrapingJobs.jobs.filter((j) => j.status === "Running").length;
  const totalFinishedJobs = completedJobs + failedJobs;
  const scrapingSuccessRate = totalFinishedJobs ? Math.round((completedJobs / totalFinishedJobs) * 100) : 0;

  const overviewCards = [
    { label: "Total Products", value: totalProducts.toLocaleString(), icon: Package, delta: "+1.4%" },
    { label: "Websites Scraped", value: websites.filter((w) => w.status === "Active").length, icon: Globe2, delta: `${websites.length} total` },
    { label: "Active Scraping Jobs", value: runningJobs, icon: Activity, delta: "live" },
    { label: "New Products This Week", value: newThisWeek.toLocaleString(), icon: Sparkles, delta: "current week" },
    { label: "Subscribed Websites", value: websites.filter((w) => w.subscribed).length, icon: Bell, delta: "alerts on" },
    { label: "Open Tickets", value: tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length, icon: Ticket, delta: "needs review" },
  ];
  const byWebsite = websites
    .filter((w) => w.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 6);
  const maxCount = Math.max(1, ...byWebsite.map((w) => w.productCount));

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}`}
        description="Here's what's happening across your carpet supplier websites."
      >
        <Link to="/dashboard/downloads"><Button variant="outline">Create export</Button></Link>
        <Link to="/dashboard/tickets"><Button>Request new website</Button></Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {overviewCards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="mt-2 font-display text-3xl font-semibold tracking-tight">{c.value}</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" /> {c.delta}
              </p>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Products by website</h3>
              <p className="text-sm text-muted-foreground">Top sources by product count</p>
            </div>
            <Link to="/dashboard/websites" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-5 space-y-3">
            {byWebsite.map((w) => (
              <div key={w.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{w.name}</span>
                  <span className="text-muted-foreground">{w.productCount.toLocaleString()}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(w.productCount / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold">Scraping success rate</h3>
          <p className="text-sm text-muted-foreground">Last 7 days</p>
          <div className="mt-6 flex items-end justify-center">
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 36 36" className="h-32 w-32">
                <path
                  className="fill-none stroke-secondary"
                  strokeWidth="3.5"
                  d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
                />
                <path
                  className="fill-none stroke-success"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={`${scrapingSuccessRate}, 100`}
                  d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-2xl font-semibold">{scrapingSuccessRate}%</span>
                <span className="text-xs text-muted-foreground">success</span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div><p className="font-semibold">{completedJobs}</p><p className="text-muted-foreground">Completed</p></div>
            <div><p className="font-semibold">{runningJobs}</p><p className="text-muted-foreground">Running</p></div>
            <div><p className="font-semibold">{failedJobs}</p><p className="text-muted-foreground">Failed</p></div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-3">
            <div>
              <h3 className="font-display text-lg font-semibold">Recent scraping activity</h3>
              <p className="text-sm text-muted-foreground">Latest jobs across your sources</p>
            </div>
            <Link to="/dashboard/scraping-status" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border border-t border-border">
            {scrapingJobs.jobs.slice(0, 8).map((j) => (
              <div key={j.id} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{j.website}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(j.finishedAt || j.startedAt).toLocaleString()} - Added {j.newProducts.toLocaleString()} - Removed {(j.removedProducts ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={j.status} />
                  <Link to="/dashboard/scraping-status" className="text-muted-foreground hover:text-foreground">
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-3">
            <div>
              <h3 className="font-display text-lg font-semibold">Latest new products</h3>
              <p className="text-sm text-muted-foreground">Discovered in recent scrapes</p>
            </div>
            <Link to="/dashboard/products" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border border-t border-border">
            {products.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-6 py-3 text-sm">
                <img src={p.imageUrl} alt="" className="h-10 w-10 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.sourceWebsite}</p>
                  <p className="text-xs text-muted-foreground">Color: {p.color || "-"} - SKU: {p.sku || "-"}</p>
                  <p className="text-xs text-muted-foreground">Added {new Date(p.dateScraped).toLocaleDateString()}</p>
                </div>
                <p className="font-medium">${p.price}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
