import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Package, Globe2, Activity, Ticket, Download,
  Settings, Search, Bell as BellIcon, ChevronDown, LogOut, User, Menu, X, Shield,
  ChevronsLeft, ChevronsRight, CheckCheck, CircleHelp,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { authService, notificationService, type AppNotification } from "@/services/api";
import { Logo } from "./Logo";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/products", label: "Products", icon: Package },
  { to: "/dashboard/websites", label: "Websites", icon: Globe2 },
  { to: "/dashboard/scraping-status", label: "Scraping Status", icon: Activity },
  { to: "/dashboard/notifications", label: "Notifications", icon: BellIcon },
  { to: "/dashboard/tickets", label: "Tickets", icon: Ticket },
  { to: "/dashboard/downloads", label: "Downloads", icon: Download },
  { to: "/dashboard/admin-settings", label: "Admin Settings", icon: Shield, adminOnly: true },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

const getVisibleNav = (role?: string) => {
  if (role === "Admin") {
    return nav;
  }

  return nav.filter((item) => !("adminOnly" in item));
};

export function DashboardLayout() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("dashboard_sidebar_collapsed") === "true";
  });
  const { data: user, isError, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: authService.getCurrentUser,
    retry: false,
  });
  const { data: notificationCount } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: notificationService.getUnreadCount,
    enabled: Boolean(user),
    refetchInterval: 30000,
  });
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", "latest"],
    queryFn: notificationService.getNotifications,
    enabled: Boolean(user),
    refetchInterval: 30000,
  });
  const userName = user?.name || "User";
  const visibleNav = getVisibleNav(user?.role);
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(to + "/");

  useEffect(() => {
    if (isError) {
      navigate({ to: "/login", replace: true });
    }
  }, [isError, navigate]);

  useEffect(() => {
    window.localStorage.setItem("dashboard_sidebar_collapsed", String(collapsed));
  }, [collapsed]);

  if (isLoading || isError) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-sidebar-border bg-sidebar transition-[transform,width] duration-200 lg:static lg:translate-x-0 ${
          collapsed ? "lg:w-20" : "lg:w-64"
        } ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className={`flex h-16 items-center justify-between border-b border-sidebar-border px-5 ${collapsed ? "lg:px-3" : ""}`}>
          <Logo collapsed={collapsed} />
          <button className="lg:hidden" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-0.5 p-3">
          {visibleNav.map((item) => {
            const active = isActive(item.to, "exact" in item ? item.exact : false);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`group flex items-center rounded-lg py-2 text-sm transition-colors ${
                  collapsed ? "lg:justify-center lg:px-2" : "gap-3 px-3"
                } ${
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className={`absolute inset-x-3 bottom-3 rounded-xl border border-sidebar-border bg-card p-3 text-xs ${collapsed ? "lg:hidden" : ""}`}>
          <p className="font-medium">Need a new site scraped?</p>
          <p className="mt-1 text-muted-foreground">Submit a request — our team handles setup.</p>
          <Link to="/dashboard/tickets">
            <Button size="sm" className="mt-3 w-full">Open ticket</Button>
          </Link>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            onClick={() => setCollapsed((value) => !value)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </Button>
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products, websites, tickets…" className="pl-9" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <NotificationDropdown
              notifications={notifications.slice(0, 5)}
              unreadCount={notificationCount?.count ?? 0}
              onChanged={async () => {
                await Promise.all([
                  queryClient.invalidateQueries({ queryKey: ["notifications"] }),
                  queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] }),
                ]);
              }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-secondary">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline">{userName}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/settings" })}>
                  <User className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sign out?</AlertDialogTitle>
                      <AlertDialogDescription>You'll need to sign in again to access the dashboard.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          await authService.logout();
                          toast.success("Signed out");
                          navigate({ to: "/login" });
                        }}
                      >
                        Sign out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function getNotificationIcon(type: AppNotification["type"]) {  if (type.includes("ticket") || type === "admin_note_added") return Ticket;
  if (type.includes("product")) return Package;
  if (type.includes("scraping")) return Activity;
  return CircleHelp;
}

function getNotificationPath(notification: AppNotification) {
  if (notification.relatedType === "ticket") return "/dashboard/tickets";
  if (notification.relatedType === "product") return "/dashboard/products";
  if (notification.relatedType === "scraping") return "/dashboard/scraping-status";
  return "/dashboard/notifications";
}

function NotificationDropdown({
  notifications,
  unreadCount,
  onChanged,
}: {
  notifications: AppNotification[];
  unreadCount: number;
  onChanged: () => Promise<void>;
}) {
  const navigate = useNavigate();

  const openNotification = async (notification: AppNotification) => {
    if (!notification.isRead) {
      await notificationService.markAsRead(notification.id);
      await onChanged();
    }
    navigate({ to: getNotificationPath(notification) as never });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-w-[calc(100vw-2rem)]">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          <Button
            size="sm"
            variant="ghost"
            disabled={unreadCount === 0}
            onClick={async () => {
              await notificationService.markAllAsRead();
              await onChanged();
              toast.success("All notifications marked as read");
            }}
          >
            <CheckCheck className="mr-2 h-4 w-4" /> Read all
          </Button>
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">No notifications yet.</div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => openNotification(notification)}
                  className={`flex w-full gap-3 px-3 py-3 text-left hover:bg-secondary ${notification.isRead ? "" : "bg-primary/5"}`}
                >
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate text-sm ${notification.isRead ? "font-medium" : "font-semibold"}`}>{notification.title}</span>
                      {!notification.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </span>
                    <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.message}</span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/notifications" as never })}>
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Generic page header
export function PageHeader({
  title, description, children,
}: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Completed: "bg-success/10 text-success",
    Running: "bg-primary/10 text-primary",
    Failed: "bg-destructive/10 text-destructive",
    Scheduled: "bg-muted text-muted-foreground",
    Active: "bg-success/10 text-success",
    active: "bg-success/10 text-success",
    expired: "bg-destructive/10 text-destructive",
    cancelled: "bg-muted text-muted-foreground",
    Paused: "bg-muted text-muted-foreground",
    "Pending setup": "bg-warning/15 text-warning-foreground",
    "In Stock": "bg-success/10 text-success",
    "Limited Stock": "bg-warning/15 text-warning-foreground",
    "Out of Stock": "bg-destructive/10 text-destructive",
    Deleted: "bg-destructive/10 text-destructive",
    "New Arrival": "bg-success/10 text-success",
    "Coming Soon": "bg-primary/10 text-primary",
    Discontinued: "bg-destructive/10 text-destructive",
    Discounted: "bg-warning/15 text-warning-foreground",
    "Make in order": "bg-accent/30 text-accent-foreground",
    Unknown: "bg-muted text-muted-foreground",
    Open: "bg-primary/10 text-primary",
    "In Progress": "bg-accent/30 text-accent-foreground",
    "Waiting for User": "bg-warning/15 text-warning-foreground",
    Resolved: "bg-success/10 text-success",
    Ready: "bg-success/10 text-success",
    Processing: "bg-primary/10 text-primary",
    Low: "bg-muted text-muted-foreground",
    Medium: "bg-primary/10 text-primary",
    High: "bg-warning/15 text-warning-foreground",
    Urgent: "bg-destructive/10 text-destructive",
    "Pending Stripe Checkout": "bg-warning/15 text-warning-foreground",
    "Pending Payment": "bg-warning/15 text-warning-foreground",
    Paid: "bg-primary/10 text-primary",
    Refunded: "bg-muted text-muted-foreground",
    Cancelled: "bg-muted text-muted-foreground",
    Validating: "bg-accent/30 text-accent-foreground",
    Rejected: "bg-destructive/10 text-destructive",
    pending_checkout: "bg-warning/15 text-warning-foreground",
    past_due: "bg-warning/15 text-warning-foreground",
    unpaid: "bg-destructive/10 text-destructive",
    cancellation_pending: "bg-warning/15 text-warning-foreground",
    "Pro Active": "bg-success/10 text-success",
    "Pro Activated": "bg-success/10 text-success",
    "Invoice Pending": "bg-warning/15 text-warning-foreground",
    "Awaiting Validation": "bg-accent/30 text-accent-foreground",
    "Pending Activation": "bg-warning/15 text-warning-foreground",
    VALIDATING: "bg-accent/30 text-accent-foreground",
    COMPLETED: "bg-success/10 text-success",
    REJECTED: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? "bg-secondary text-secondary-foreground"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {status}
    </span>
  );
}
