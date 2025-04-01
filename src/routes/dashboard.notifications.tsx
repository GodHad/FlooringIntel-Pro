import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Activity, Bell, CheckCheck, Package, ReceiptText, Search, Ticket, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { notificationService, type AppNotification } from "@/services/api";

export const Route = createFileRoute("/dashboard/notifications")({
  head: () => ({ meta: [{ title: "Notifications - FlooringIntel" }] }),
  component: NotificationsPage,
});

const filters = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "invoice", label: "Invoice" },
  { value: "ticket", label: "Ticket" },
  { value: "products", label: "Products" },
  { value: "scraping", label: "Scraping" },
] as const;

function getIcon(type: AppNotification["type"]) {
  if (type.includes("invoice")) return ReceiptText;
  if (type.includes("ticket") || type === "admin_note_added") return Ticket;
  if (type.includes("product")) return Package;
  if (type.includes("scraping")) return Activity;
  return Bell;
}

function getDestination(notification: AppNotification) {
  if (notification.relatedType === "invoice" && notification.relatedId) return `/dashboard/invoices/${notification.relatedId}`;
  if (notification.relatedType === "ticket") return "/dashboard/tickets";
  if (notification.relatedType === "product") return "/dashboard/products";
  if (notification.relatedType === "scraping") return "/dashboard/scraping-status";
  return "/dashboard/notifications";
}

function matchesFilter(notification: AppNotification, filter: string) {
  if (filter === "all") return true;
  if (filter === "unread") return !notification.isRead;
  if (filter === "invoice") return notification.type.includes("invoice") || notification.relatedType === "invoice";
  if (filter === "ticket") return notification.type.includes("ticket") || notification.relatedType === "ticket";
  if (filter === "products") return notification.type.includes("product") || notification.relatedType === "product";
  if (filter === "scraping") return notification.type.includes("scraping") || notification.relatedType === "scraping";
  return true;
}

function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.getNotifications,
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return notifications.filter((notification) => (
      matchesFilter(notification, filter)
      && (!term || `${notification.title} ${notification.message}`.toLowerCase().includes(term))
    ));
  }, [filter, notifications, q]);

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] }),
    ]);
  };

  const openNotification = async (notification: AppNotification) => {
    if (!notification.isRead) {
      await notificationService.markAsRead(notification.id);
      await refresh();
    }
    navigate({ to: getDestination(notification) as never });
  };

  return (
    <div>
      <PageHeader title="Notifications" description="Invoice, ticket, product, and scraping updates">
        <Button
          variant="outline"
          onClick={async () => {
            await notificationService.markAllAsRead();
            await refresh();
            toast.success("All notifications marked as read");
          }}
        >
          <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
        </Button>
      </PageHeader>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[220px_1fr]">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {filters.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search notifications..." className="pl-9" />
          </div>
        </div>
      </Card>

      <Card className="mt-4 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No notifications yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((notification) => {
              const Icon = getIcon(notification.type);
              return (
                <div key={notification.id} className={`flex gap-3 p-4 ${notification.isRead ? "" : "bg-primary/5"}`}>
                  <button
                    type="button"
                    onClick={() => openNotification(notification)}
                    className="flex min-w-0 flex-1 gap-3 text-left"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className={`text-sm ${notification.isRead ? "font-medium" : "font-semibold"}`}>{notification.title}</span>
                        {!notification.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">{notification.message}</span>
                      <span className="mt-2 block text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</span>
                    </span>
                  </button>
                  <div className="flex shrink-0 items-start gap-1">
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          await notificationService.markAsRead(notification.id);
                          await refresh();
                          toast.success("Notification marked as read");
                        }}
                      >
                        Read
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={async () => {
                        await notificationService.deleteNotification(notification.id);
                        await refresh();
                        toast.success("Notification deleted");
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
