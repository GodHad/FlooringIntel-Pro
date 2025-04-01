import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader, StatusBadge } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { authService, getApiUrl, ticketService } from "@/services/api";
import type { Ticket } from "@/data/mock";
import { Plus, Paperclip } from "lucide-react";

export const Route = createFileRoute("/dashboard/tickets")({
  head: () => ({ meta: [{ title: "Tickets — FlooringIntel" }] }),
  component: TicketsPage,
});

function TicketsPage() {
  const queryClient = useQueryClient();
  const { data: tickets = [] } = useQuery({ queryKey: ["tickets"], queryFn: ticketService.getTickets });
  const { data: user } = useQuery({ queryKey: ["current-user"], queryFn: authService.getCurrentUser });
  const isAdmin = user?.role === "Admin";

  return (
    <div>
      <PageHeader title="Tickets" description="Requests, scraping issues, and support">
        <NewTicketDialog />
      </PageHeader>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Ticket</th>
                <th className="p-3">Subject</th>
                {isAdmin && <th className="p-3 hidden lg:table-cell">User</th>}
                <th className="p-3 hidden md:table-cell">Type</th>
                <th className="p-3 hidden lg:table-cell">Website</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3 hidden md:table-cell">Created</th>
                <th className="p-3 hidden lg:table-cell">Updated</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                  <td className="p-3 font-medium">{t.subject}</td>
                  {isAdmin && (
                    <td className="p-3 hidden lg:table-cell text-muted-foreground">
                      <p>{t.userName ?? "Unknown"}</p>
                      <p className="text-xs">{t.userEmail}</p>
                    </td>
                  )}
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{t.type}</td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground">{t.website ?? "—"}</td>
                  <td className="p-3"><StatusBadge status={t.priority} /></td>
                  <td className="p-3"><StatusBadge status={t.status} /></td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground">{new Date(t.lastUpdate).toLocaleDateString()}</td>
                  <td className="p-3">
                    <TicketDialog
                      ticket={t}
                      isAdmin={isAdmin}
                      onUpdated={async () => {
                        await queryClient.invalidateQueries({ queryKey: ["tickets"] });
                        toast.success("Ticket updated");
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function TicketDialog({
  ticket,
  isAdmin,
  onUpdated,
}: {
  ticket: Ticket;
  isAdmin: boolean;
  onUpdated: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [notes, setNotes] = useState(ticket.notes ?? "");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">View</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ticket.id}</DialogTitle>
          <DialogDescription>{ticket.subject}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {isAdmin && (
            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <p className="font-medium">{ticket.userName ?? "Unknown user"}</p>
              <p className="text-muted-foreground">{ticket.userEmail}</p>
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <Info label="Type" value={ticket.type} />
            <Info label="Website" value={ticket.website ?? "-"} />
            <Info label="Created" value={new Date(ticket.createdAt).toLocaleString()} />
            <Info label="Updated" value={new Date(ticket.lastUpdate).toLocaleString()} />
          </div>
          {ticket.message && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Message</p>
              <p className="mt-1 rounded-lg border border-border bg-secondary/30 p-3">{ticket.message}</p>
            </div>
          )}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Attachments</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {ticket.attachments.map((attachment) => (
                  <a
                    key={`${attachment.name}-${attachment.size}`}
                    href={attachment.url ? getApiUrl(attachment.url) : '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-lg border border-border bg-secondary/30"
                  >
                    {attachment.url && (
                      <img
                        src={getApiUrl(attachment.url)}
                        alt={attachment.name}
                        className="h-48 w-full object-contain transition-transform group-hover:scale-[1.02]"
                      />
                    )}
                    <div className="flex items-center justify-between border-t border-border px-3 py-2">
                      <span className="truncate font-medium">{attachment.name}</span>
                      <span className="ml-3 shrink-0 text-xs text-muted-foreground">{Math.ceil(attachment.size / 1024)} KB</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
          {isAdmin ? (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(value: Ticket["status"]) => setStatus(value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Open", "In Progress", "Waiting for User", "Resolved"].map((value) => (
                        <SelectItem key={value} value={value}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(value: Ticket["priority"]) => setPriority(value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Low", "Medium", "High", "Urgent"].map((value) => (
                        <SelectItem key={value} value={value}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Admin note</Label>
                <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
              </div>
            </>
          ) : ticket.notes ? (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Admin note</p>
              <p className="mt-1 rounded-lg border border-border bg-secondary/30 p-3">{ticket.notes}</p>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Close</Button>
          {isAdmin && (
            <Button
              onClick={async () => {
                await ticketService.updateTicket(ticket.id, { status, priority, notes });
                await onUpdated();
                setOpen(false);
              }}
            >
              Save changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function NewTicketDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("New website scraping request");
  const [attachments, setAttachments] = useState<Ticket["attachments"]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const attachFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const next = await Promise.all(Array.from(files).map(async (file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return null;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 2 MB`);
        return null;
      }
      
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        file: file,
      };
    }));

    setAttachments((current) => [...(current ?? []), ...next.filter(Boolean) as NonNullable<Ticket["attachments"]>]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> New ticket</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a ticket</DialogTitle>
          <DialogDescription>Request a new website, report an issue, or ask for help.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const payload = new FormData();

            payload.append("type", type);
            payload.append("subject", String(form.get("subject") || ""));
            payload.append(
              "website",
              String(form.get("website") || form.get("websiteUrl") || "")
            );
            payload.append("priority", String(form.get("priority") || "Medium"));
            payload.append("message", String(form.get("message") || ""));
            payload.append("notes", String(form.get("notes") || ""));

            attachments?.forEach((attachment) => {
              if (attachment.file) {
                payload.append("attachments", attachment.file);
              }
            });

            await ticketService.createTicket(payload);
            setOpen(false);
            setAttachments([]);
            toast.success("Your request has been submitted. Our team will review the website and update the ticket status.");
          }}
        >
          <div className="space-y-2">
            <Label>Ticket type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="New website scraping request">New website scraping request</SelectItem>
                <SelectItem value="Scraping issue">Scraping issue</SelectItem>
                <SelectItem value="Product data issue">Product data issue</SelectItem>
                <SelectItem value="Export issue">Export issue</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Subject</Label><Input name="subject" required /></div>
          {type === "New website scraping request" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Website name</Label><Input name="website" required /></div>
                <div className="space-y-2"><Label>Website URL</Label><Input name="websiteUrl" required type="url" /></div>
              </div>
              <div className="space-y-2"><Label>What product data should be scraped?</Label><Textarea name="message" /></div>
              <div className="space-y-2"><Label>How often should it be scraped?</Label><Input name="frequency" placeholder="Daily / Weekly" /></div>
              <div className="space-y-2"><Label>Notes</Label><Textarea name="notes" /></div>
            </>
          ) : (
            <>
              <div className="space-y-2"><Label>Website URL (optional)</Label><Input name="websiteUrl" type="url" /></div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select name="priority" defaultValue="Medium">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Low", "Medium", "High", "Urgent"].map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Message</Label><Textarea name="message" required /></div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => attachFiles(event.target.files)}
          />
          <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="mr-2 h-4 w-4" /> Attach screenshot
          </Button>
          {attachments && attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div key={`${attachment.name}-${attachment.size}`} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm">
                  <span>{attachment.name}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setAttachments((current) => current?.filter((item) => item !== attachment))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Submit ticket</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
