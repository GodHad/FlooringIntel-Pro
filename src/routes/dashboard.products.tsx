import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader, StatusBadge } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { type ExportDownload, type ProductListParams, productService, websiteService } from "@/services/api";
import {
  Search, Download, ExternalLink, Eye, ChevronLeft, ChevronRight, ArrowUpDown, X, Copy, LayoutGrid, List,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/products")({
  head: () => ({ meta: [{ title: "Products — FlooringIntel" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    website: typeof search.website === "string" ? search.website : undefined,
  }),
  component: ProductsPage,
});

const availabilities = ["In Stock", "Limited Stock", "Out of Stock", "Unknown"];
const pageSizeOptions = [8, 16, 24, 48];
const defaultPageSize = 24;

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
};

const getProductBadge = (product: { is_deleted?: boolean; product_badge?: string | null; productBadge?: string | null; availability: string }) => {
  if (product.is_deleted) return "Deleted";
  return product.product_badge || product.productBadge || product.availability;
};

const showExportToast = (download: ExportDownload, fallbackMessage: string) => {
  if (download.metadata.limited) {
    toast.success("Your free plan export includes the first 50 products. Upgrade for unlimited exports.");
    return;
  }
  toast.success(fallbackMessage);
};

function ProductsPage() {
  const { website } = useSearch({ from: "/dashboard/products" });
  const { data: websites = [] } = useQuery({ queryKey: ["websites"], queryFn: () => websiteService.getWebsites() });
  const [q, setQ] = useState("");
  const [site, setSite] = useState<string>(website || "all");
  const [avail, setAvail] = useState<string>("all");
  const [addedFrom, setAddedFrom] = useState<string>("");
  const [addedTo, setAddedTo] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window === "undefined") return defaultPageSize;
    const stored = Number(window.localStorage.getItem("products_page_size"));
    return pageSizeOptions.includes(stored) ? stored : defaultPageSize;
  });
  const [sortBy, setSortBy] = useState<"name" | "price" | "dateScraped">("dateScraped");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">(() => {
    if (typeof window === "undefined") return "table";
    return window.localStorage.getItem("products_view_mode") === "card" ? "card" : "table";
  });

  const productQuery = useMemo<ProductListParams>(() => ({
    page,
    pageSize,
    q,
    website: site,
    availability: avail,
    addedFrom,
    addedTo,
    sortBy,
    sortDir,
  }), [page, pageSize, q, site, avail, addedFrom, addedTo, sortBy, sortDir]);

  const { data: productResult } = useQuery({
    queryKey: ["products", productQuery],
    queryFn: () => productService.getProducts(productQuery),
    placeholderData: (previousData) => previousData,
  });

  const paged = productResult?.data ?? [];
  const totalProducts = productResult?.total ?? 0;
  const totalPages = productResult?.totalPages ?? 1;
  const pageStart = totalProducts === 0 ? 0 : ((page - 1) * pageSize) + 1;
  const pageEnd = Math.min(page * pageSize, totalProducts);
  const exportFilters = useMemo<ProductListParams>(() => ({
    q,
    website: site,
    availability: avail,
    addedFrom,
    addedTo,
    sortBy,
    sortDir,
  }), [q, site, avail, addedFrom, addedTo, sortBy, sortDir]);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [q, site, avail, addedFrom, addedTo, sortBy, sortDir]);

  useEffect(() => {
    setSite(website || "all");
  }, [website]);

  useEffect(() => {
    window.localStorage.setItem("products_view_mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    window.localStorage.setItem("products_page_size", String(pageSize));
  }, [pageSize]);

  const allSelected = paged.length > 0 && paged.every((p) => selected.has(p.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) paged.forEach((p) => next.delete(p.id));
    else paged.forEach((p) => next.add(p.id));
    setSelected(next);
  };
  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleSort = (k: typeof sortBy) => {
    if (sortBy === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(k); setSortDir("asc"); }
  };

  const openProduct = openId ? paged.find((p) => p.id === openId) : null;
  const openProductImages = openProduct
    ? Array.from(new Set([openProduct.imageUrl, ...(openProduct.imageUrls ?? [])].filter(Boolean)))
    : [];
  const largeImage = activeImage || openProductImages[0];
  const openProductDetails = openProduct?.details?.filter((detail) => {
    if (Array.isArray(detail.value)) return detail.value.length > 0;
    return detail.value !== undefined && detail.value !== null && String(detail.value).trim() !== "";
  }) ?? [];

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${totalProducts.toLocaleString()} carpet products across all supplier websites`}
      >
        <Button
          variant="outline"
          onClick={() => { setQ(""); setSite("all"); setAvail("all"); setAddedFrom(""); setAddedTo(""); }}
        >
          <X className="mr-2 h-4 w-4" /> Clear filters
        </Button>
        <Button
          onClick={async () => {
            const download = await productService.downloadProductsExcel({ filters: exportFilters });
            downloadBlob(download.blob, `filtered-products-${Date.now()}.xlsx`);
            showExportToast(download, `Downloading ${totalProducts.toLocaleString()} filtered products`);
          }}
        >
          <Download className="mr-2 h-4 w-4" /> Export filtered
        </Button>
      </PageHeader>

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-md border border-border bg-background p-1">
            <Button
              type="button"
              size="sm"
              variant={viewMode === "table" ? "secondary" : "ghost"}
              onClick={() => setViewMode("table")}
              title="Table view"
            >
              <List className="mr-2 h-4 w-4" /> Table
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === "card" ? "secondary" : "ghost"}
              onClick={() => setViewMode("card")}
              title="Card view"
            >
              <LayoutGrid className="mr-2 h-4 w-4" /> Cards
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => toggleSort("name")}>
              Name <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => toggleSort("price")}>
              Price <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => toggleSort("dateScraped")}>
              Updated <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} className="h-10 pl-9" />
          </div>
          <Select value={site} onValueChange={setSite}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Website" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All websites</SelectItem>
              {websites.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={avail} onValueChange={setAvail}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Availability" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any availability</SelectItem>
              {availabilities.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex h-10 items-center overflow-hidden rounded-md border border-input bg-background">
            <span className="h-full border-r border-input px-3 py-2.5 text-xs font-medium text-muted-foreground">From</span>
            <Input
              type="date"
              value={addedFrom}
              onChange={(e) => setAddedFrom(e.target.value)}
              aria-label="Start date"
              className="h-10 rounded-none border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="flex h-10 items-center overflow-hidden rounded-md border border-input bg-background">
            <span className="h-full border-r border-input px-3 py-2.5 text-xs font-medium text-muted-foreground">To</span>
            <Input
              type="date"
              value={addedTo}
              onChange={(e) => setAddedTo(e.target.value)}
              aria-label="End date"
              className="h-10 rounded-none border-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
        {selected.size > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm">
            <span><strong>{selected.size}</strong> selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
              <Button size="sm" onClick={async () => {
                const download = await productService.downloadProductsExcel({ ids: Array.from(selected) });
                downloadBlob(download.blob, `selected-products-${Date.now()}.xlsx`);
                showExportToast(download, `Downloading ${selected.size} products`);
              }}>
                <Download className="mr-2 h-4 w-4" /> Download selected
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="mt-4 overflow-hidden">
        {viewMode === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></th>
                <th className="p-3 hidden md:table-cell">Category</th>
                <th className="p-3">Image</th>
                <th className="cursor-pointer p-3" onClick={() => toggleSort("name")}>
                  <span className="inline-flex items-center gap-1">Product <ArrowUpDown className="h-3 w-3" /></span>
                </th>
                <th className="p-3">Website</th>
                <th className="p-3 hidden xl:table-cell">Color</th>
                <th className="p-3 hidden lg:table-cell">Material</th>
                <th className="p-3 hidden lg:table-cell">Size</th>
                <th className="cursor-pointer p-3" onClick={() => toggleSort("price")}>
                  <span className="inline-flex items-center gap-1">Price <ArrowUpDown className="h-3 w-3" /></span>
                </th>
                <th className="p-3">Availability</th>
                <th className="cursor-pointer p-3 hidden md:table-cell" onClick={() => toggleSort("dateScraped")}>
                  <span className="inline-flex items-center gap-1">Updated <ArrowUpDown className="h-3 w-3" /></span>
                </th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="p-3"><Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggle(p.id)} /></td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{p.category}</td>
                  <td className="p-3"><img src={p.imageUrl} alt="" className="h-10 w-10 rounded-md object-cover" /></td>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-muted-foreground">{p.sourceWebsite}</td>
                  <td className="p-3 hidden xl:table-cell text-muted-foreground">{p.color}</td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground">{p.material}</td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground">{p.size}</td>
                  <td className="p-3 font-medium">${p.price}</td>
                  <td className="p-3"><StatusBadge status={getProductBadge(p)} /></td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{new Date(p.lastUpdated).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => {
                        setOpenId(p.id);
                        setActiveImage(p.imageUrl || null);
                      }}><Eye className="h-4 w-4" /></Button>
                      <a href={p.productUrl} target="_blank" rel="noreferrer">
                        <Button size="icon" variant="ghost"><ExternalLink className="h-4 w-4" /></Button>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={12} className="p-12 text-center text-sm text-muted-foreground">
                  No products match these filters.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {paged.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="relative aspect-[5/3] bg-muted">
                  <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                  <div className="absolute right-3 top-3">
                    <StatusBadge status={getProductBadge(p)} />
                  </div>
                </div>
                <div className="flex items-start justify-between gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-medium leading-snug">{p.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">COLOR: {p.color || "-"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">SKU: {p.sku || "-"}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                    <Button size="sm" variant="outline" onClick={() => {
                      setOpenId(p.id);
                      setActiveImage(p.imageUrl || null);
                    }}><Eye className="mr-2 h-4 w-4" />View</Button>
                    <a href={p.productUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="ghost"><ExternalLink className="mr-2 h-4 w-4" />Link</Button>
                    </a>
                  </div>
                </div>
              </div>
            ))}
            {paged.length === 0 && (
              <div className="col-span-full p-12 text-center text-sm text-muted-foreground">
                No products match these filters.
              </div>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} · Showing {pageStart.toLocaleString()}-{pageEnd.toLocaleString()} of {totalProducts.toLocaleString()} products
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
                setSelected(new Set());
              }}
            >
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((value) => (
                  <SelectItem key={value} value={String(value)}>{value} per page</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Sheet open={!!openId} onOpenChange={(o) => {
        if (!o) {
          setOpenId(null);
          setActiveImage(null);
        }
      }}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {openProduct && (
            <>
              <SheetHeader>
                <SheetTitle>{openProduct.name}</SheetTitle>
                <SheetDescription>{openProduct.sourceWebsite} · SKU {openProduct.sku} {openProduct.color ? ` · COLOR ${openProduct.color}` : ''}</SheetDescription>
              </SheetHeader>
              {openProductImages.length > 0 && (
                <div className="mt-4 space-y-3">
                  <img src={largeImage} alt="" className="aspect-square w-full rounded-xl object-cover" />
                  {openProductImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {openProductImages.map((imageUrl) => (
                        <button
                          key={imageUrl}
                          type="button"
                          onClick={() => setActiveImage(imageUrl)}
                          className={`overflow-hidden rounded-md border ${largeImage === imageUrl ? "border-primary" : "border-border"}`}
                        >
                          <img src={imageUrl} alt="" className="aspect-square w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="mt-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Product details</p>
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <Info label="Availability"><StatusBadge status={getProductBadge(openProduct)} /></Info>
                  {openProductDetails.map((detail) => (
                    <Info
                      key={detail.field}
                      label={detail.label}
                      value={Array.isArray(detail.value) ? detail.value.join(", ") : String(detail.value)}
                    />
                  ))}
                </div>
              </div>
              {openProduct.description && (
                <div className="mt-5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Description</p>
                  <p className="mt-2 text-sm leading-relaxed">{openProduct.description}</p>
                </div>
              )}
              <div className="mt-5 border-t border-border pt-3 text-xs text-muted-foreground">
                <p>Product Added: {new Date(openProduct.dateScraped).toLocaleString()}</p>
                <p className="mt-1">Last updated: {new Date(openProduct.lastUpdated).toLocaleString()}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  onClick={async () => {
                    const download = await productService.downloadProductsExcel({ ids: [openProduct.id] });
                    downloadBlob(download.blob, `${openProduct.sku || openProduct.id}.xlsx`);
                    showExportToast(download, "Downloading product export");
                  }}
                >
                  <Download className="mr-2 h-4 w-4" /> Download single
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(openProduct.productUrl);
                    toast.success("Link copied");
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy product link
                </Button>
                <a href={openProduct.productUrl} target="_blank" rel="noreferrer">
                  <Button variant="ghost"><ExternalLink className="mr-2 h-4 w-4" /> Open original</Button>
                </a>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Info({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1 font-medium">{value ?? children}</div>
    </div>
  );
}
