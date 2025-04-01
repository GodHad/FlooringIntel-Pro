// Mock data for FlooringIntel

export interface Website {
  id: string;
  name: string;
  domain: string;
  productCount: number;
  lastScrape: string;
  frequency: "Daily" | "Weekly" | "Hourly" | "Manual";
  status: "Active" | "Paused" | "Failed" | "Pending setup";
  enabled?: boolean;
  hasVariants?: boolean;
  sortOrder?: number;
  subscribed: boolean;
  proSubscribed?: boolean;
  logo?: string;
  subscription?: {
    planType: string;
    planSlug?: string;
    status: "active" | "expired" | "cancelled" | "pending" | "trialing";
    startDate: string;
    expirationDate: string;
    unlimitedDownloads: boolean;
    downloadLimit?: number | null;
    activatedAt?: string;
    invoiceId?: string;
    billingCycle?: "monthly" | "yearly";
  } | null;
  pendingInvoice?: {
    invoiceId: string;
    status: "Pending Payment" | "Paid" | "Validating";
  } | null;
}

export interface Product {
  id: string;
  name: string;
  sourceWebsite: string;
  sourceWebsiteId?: string;
  category: string;
  material: string;
  size: string;
  color: string;
  price: number;
  currency: string;
  availability: "In Stock" | "Limited Stock" | "Out of Stock" | "Unknown" | string;
  product_badge?: string | null;
  productBadge?: string | null;
  is_deleted?: boolean;
  imageUrl: string;
  imageUrls?: string[];
  productUrl: string;
  sku: string;
  description: string;
  details?: Array<{
    field: string;
    label: string;
    value: string | number | boolean | string[];
  }>;
  dateScraped: string;
  lastUpdated: string;
}

export interface ScrapingJob {
  id: string;
  website: string;
  startedAt: string;
  finishedAt: string | null;
  duration: string;
  productsFound: number;
  newProducts: number;
  removedProducts?: number;
  added_count?: number;
  removed_count?: number;
  addedUrls?: number;
  removedUrls?: number;
  updatedProducts: number;
  status: "Completed" | "Running" | "Failed" | "Scheduled";
  errorMessage?: string;
}

export interface ScrapingJobList {
  jobs: Array<ScrapingJob>,
  runningCount: number,
  completeCount: number,
  failCount: number,
  scheduleCount: number
}

export interface Ticket {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  subject: string;
  type: string;
  website?: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Waiting for User" | "Resolved";
  message?: string;
  notes?: string;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
    file?: File;
    url?: string;
  }>;
  createdAt: string;
  lastUpdate: string;
}

export interface ExportRecord {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  fileName: string;
  exportType: string;
  website?: string;
  dateRange?: string;
  createdAt: string;
  status: "Ready" | "Processing" | "Failed";
  fileUrl?: string;
  fileSize?: number;
  generatedAt?: string;
  errorMessage?: string;
}

export const websites: Website[] = [
  { id: "w1", name: "Shaw Floors", domain: "shawfloors.com", productCount: 4280, lastScrape: "2026-05-22T08:14:00Z", frequency: "Daily", status: "Active", subscribed: true },
  { id: "w2", name: "Mohawk Flooring", domain: "mohawkflooring.com", productCount: 3950, lastScrape: "2026-05-22T07:42:00Z", frequency: "Daily", status: "Active", subscribed: true },
  { id: "w3", name: "Karastan", domain: "karastan.com", productCount: 1820, lastScrape: "2026-05-22T06:20:00Z", frequency: "Daily", status: "Active", subscribed: false },
  { id: "w4", name: "Stanton Carpet", domain: "stantoncarpet.com", productCount: 1245, lastScrape: "2026-05-21T22:10:00Z", frequency: "Weekly", status: "Active", subscribed: true },
  { id: "w5", name: "Dixie Home", domain: "dixiehome.com", productCount: 980, lastScrape: "2026-05-21T18:30:00Z", frequency: "Weekly", status: "Paused", subscribed: false },
  { id: "w6", name: "Couristan", domain: "couristan.com", productCount: 2140, lastScrape: "2026-05-22T04:55:00Z", frequency: "Daily", status: "Active", subscribed: false },
  { id: "w7", name: "Masland Carpets", domain: "masland.com", productCount: 1675, lastScrape: "2026-05-22T03:12:00Z", frequency: "Daily", status: "Failed", subscribed: true },
  { id: "w8", name: "Anderson Tuftex", domain: "andersontuftex.com", productCount: 2890, lastScrape: "2026-05-22T05:48:00Z", frequency: "Daily", status: "Active", subscribed: false },
  { id: "w9", name: "Fabrica", domain: "fabrica.com", productCount: 760, lastScrape: "2026-05-20T14:00:00Z", frequency: "Weekly", status: "Active", subscribed: false },
  { id: "w10", name: "Kane Carpet", domain: "kanecarpet.com", productCount: 0, lastScrape: "", frequency: "Manual", status: "Pending setup", subscribed: false },
];

const carpetImg = (seed: string) =>
  `https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=400&fit=crop&auto=format&q=70&sig=${seed}`;

const productNames = [
  "Natura Wool Loop Carpet", "Heritage Patterned Broadloom", "SoftTouch Nylon Carpet",
  "Modern Berber Textured Carpet", "Luxury Velvet Residential Carpet", "Commercial Grade Loop Carpet",
  "Cascade Plush Carpet", "Highland Tweed Carpet", "Coastal Sisal Blend", "Aspen Frieze Carpet",
  "Manhattan Cut Pile", "Savannah Wool Carpet", "Mosaic Patterned Carpet", "Premier Saxony Carpet",
  "Urban Industrial Loop", "Tuscany Hand-Loomed Rug", "Riverside Berber Carpet", "Empire Velvet Plush",
  "Bayside Nylon Broadloom", "Cottage Patterned Wool", "Atlas Commercial Carpet", "Vista Plush Saxony",
  "Pinewood Textured Loop", "Marquis Luxury Carpet", "Studio Modern Berber", "Highland Estate Wool",
  "Coastal Living Sisal", "Metro Office Carpet",
];

const categories = ["Residential Carpet", "Commercial Carpet", "Area Rugs", "Broadloom", "Wool Carpet", "Nylon Carpet", "Patterned Carpet", "Textured Carpet"];
const materials = ["Wool", "Nylon", "Polyester", "Sisal", "Wool Blend", "Polypropylene"];
const sizes = ["12 ft wide", "15 ft wide", "8x10 ft", "9x12 ft", "5x7 ft", "Custom"];
const colors = ["Ivory", "Charcoal", "Sand", "Slate", "Mocha", "Pearl", "Walnut", "Linen", "Storm", "Bone"];
const availabilities: Product["availability"][] = ["In Stock", "In Stock", "Limited Stock", "Out of Stock", "Unknown"];

export const products: Product[] = productNames.map((name, i) => {
  const site = websites[i % websites.length];
  return {
    id: `p${i + 1}`,
    name,
    sourceWebsite: site.name,
    category: categories[i % categories.length],
    material: materials[i % materials.length],
    size: sizes[i % sizes.length],
    color: colors[i % colors.length],
    price: 49 + ((i * 37) % 480),
    currency: "USD",
    availability: availabilities[i % availabilities.length],
    imageUrl: carpetImg(String(i)),
    productUrl: `https://${site.domain}/products/${name.toLowerCase().replace(/\s+/g, "-")}`,
    sku: `SKU-${1000 + i}`,
    description:
      "Premium carpet engineered for durability and style. Soft underfoot with stain-resistant treatment and color-fast fibers, suitable for residential and light commercial use.",
    dateScraped: new Date(Date.now() - i * 86400000 * 0.3).toISOString(),
    lastUpdated: new Date(Date.now() - i * 86400000 * 0.1).toISOString(),
  };
});

export const scrapingJobs: ScrapingJob[] = [
  { id: "j1001", website: "Shaw Floors", startedAt: "2026-05-22T08:00:00Z", finishedAt: "2026-05-22T08:14:00Z", duration: "14m 02s", productsFound: 4280, newProducts: 24, updatedProducts: 112, status: "Completed" },
  { id: "j1002", website: "Mohawk Flooring", startedAt: "2026-05-22T07:30:00Z", finishedAt: "2026-05-22T07:42:00Z", duration: "12m 18s", productsFound: 3950, newProducts: 17, updatedProducts: 88, status: "Completed" },
  { id: "j1003", website: "Karastan", startedAt: "2026-05-22T09:00:00Z", finishedAt: null, duration: "—", productsFound: 0, newProducts: 0, updatedProducts: 0, status: "Running" },
  { id: "j1004", website: "Masland Carpets", startedAt: "2026-05-22T03:00:00Z", finishedAt: "2026-05-22T03:12:00Z", duration: "12m 04s", productsFound: 0, newProducts: 0, updatedProducts: 0, status: "Failed", errorMessage: "Target website structure changed or blocked the request." },
  { id: "j1005", website: "Couristan", startedAt: "2026-05-22T04:30:00Z", finishedAt: "2026-05-22T04:55:00Z", duration: "25m 11s", productsFound: 2140, newProducts: 6, updatedProducts: 40, status: "Completed" },
  { id: "j1006", website: "Anderson Tuftex", startedAt: "2026-05-22T12:00:00Z", finishedAt: null, duration: "—", productsFound: 0, newProducts: 0, updatedProducts: 0, status: "Scheduled" },
  { id: "j1007", website: "Stanton Carpet", startedAt: "2026-05-21T22:00:00Z", finishedAt: "2026-05-21T22:10:00Z", duration: "10m 22s", productsFound: 1245, newProducts: 3, updatedProducts: 18, status: "Completed" },
];

export const tickets: Ticket[] = [
  { id: "T-2041", subject: "Request scraping for Beaulieu Carpets", type: "New website scraping request", website: "beaulieu.com", priority: "Medium", status: "In Progress", createdAt: "2026-05-20T10:00:00Z", lastUpdate: "2026-05-21T15:00:00Z" },
  { id: "T-2042", subject: "Masland scraper failing since yesterday", type: "Scraping issue", website: "masland.com", priority: "High", status: "Open", createdAt: "2026-05-22T09:00:00Z", lastUpdate: "2026-05-22T09:00:00Z" },
  { id: "T-2043", subject: "Need CSV export option in addition to Excel", type: "Export issue", priority: "Low", status: "Waiting for User", createdAt: "2026-05-18T11:00:00Z", lastUpdate: "2026-05-19T13:20:00Z" },
  { id: "T-2044", subject: "Incorrect product material data for Karastan", type: "Product data issue", website: "karastan.com", priority: "Medium", status: "Resolved", createdAt: "2026-05-15T08:00:00Z", lastUpdate: "2026-05-17T10:00:00Z" },
  { id: "T-2045", subject: "Add scraping for Tarkett residential line", type: "New website scraping request", website: "tarkett.com", priority: "Low", status: "Open", createdAt: "2026-05-22T07:30:00Z", lastUpdate: "2026-05-22T07:30:00Z" },
];

export const exports_: ExportRecord[] = [
  { id: "e1", fileName: "all-carpet-products.xlsx", exportType: "All products", createdAt: "2026-05-22T09:10:00Z", status: "Ready" },
  { id: "e2", fileName: "shaw-products-may-2026.xlsx", exportType: "By website", website: "Shaw Floors", dateRange: "May 2026", createdAt: "2026-05-21T17:30:00Z", status: "Ready" },
  { id: "e3", fileName: "new-products-this-week.xlsx", exportType: "New products", dateRange: "Last 7 days", createdAt: "2026-05-21T08:00:00Z", status: "Ready" },
  { id: "e4", fileName: "mohawk-available-only.xlsx", exportType: "Available only", website: "Mohawk Flooring", createdAt: "2026-05-20T14:00:00Z", status: "Ready" },
  { id: "e5", fileName: "filtered-wool-carpets.xlsx", exportType: "Filtered products", createdAt: "2026-05-19T11:20:00Z", status: "Processing" },
];

export const stats = {
  totalProducts: products.length * 850,
  websitesScraped: websites.filter((w) => w.status === "Active").length,
  activeJobs: scrapingJobs.filter((j) => j.status === "Running").length,
  newThisWeek: 312,
  subscribed: websites.filter((w) => w.subscribed).length,
  openTickets: tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length,
};
