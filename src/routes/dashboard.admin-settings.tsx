import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader, StatusBadge } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Save, Trash2 } from "lucide-react";
import { adminService, type AdminBillingInfo, type AdminUserSubscription, type BillingSettings } from "@/services/api";

export const Route = createFileRoute("/dashboard/admin-settings")({
  head: () => ({ meta: [{ title: "Admin Settings - FlooringIntel" }] }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ["admin-users"], queryFn: adminService.getUsers });
  const { data: settings } = useQuery({ queryKey: ["billing-settings"], queryFn: adminService.getBillingSettings });
  const { data: billingInfo, isLoading: billingInfoLoading } = useQuery({ queryKey: ["admin-billing-info"], queryFn: adminService.getAdminBillingInfo });
  const [pricing, setPricing] = useState<BillingSettings>({
    freeDownloadLimit: 50,
    freeTrialDays: 14,
    plans: [],
  });
  const [billingForm, setBillingForm] = useState<AdminBillingInfo>({
    companyName: "",
    billingEmail: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "",
    taxId: "",
    invoiceFooterNote: "",
  });
  const [billingSaving, setBillingSaving] = useState(false);

  useEffect(() => {
    if (settings) setPricing(settings);
  }, [settings]);

  useEffect(() => {
    if (billingInfo) setBillingForm({ ...billingForm, ...billingInfo });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingInfo]);

  const updatePlan = (index: number, patch: Partial<BillingSettings["plans"][number]>) => {
    setPricing((current) => ({
      ...current,
      plans: current.plans.map((plan, planIndex) => (
        planIndex === index ? { ...plan, ...patch } : plan
      )),
    }));
  };

  const savePricing = async (event: React.FormEvent) => {
    event.preventDefault();
    await adminService.updateBillingSettings(pricing);
    await queryClient.invalidateQueries({ queryKey: ["billing-settings"] });
    toast.success("Pricing settings saved");
  };

  const updateBillingField = (field: keyof AdminBillingInfo, value: string) => {
    setBillingForm((current) => ({ ...current, [field]: value }));
  };

  const saveBillingInfo = async (event: React.FormEvent) => {
    event.preventDefault();
    const required: Array<keyof AdminBillingInfo> = ["companyName", "billingEmail", "phone", "addressLine1", "city", "stateProvince", "postalCode", "country"];
    const missing = required.filter((field) => !billingForm[field]?.trim());
    if (missing.length) {
      toast.error("Please complete all required billing fields");
      return;
    }

    setBillingSaving(true);
    try {
      const saved = await adminService.updateAdminBillingInfo(billingForm);
      setBillingForm(saved);
      await queryClient.invalidateQueries({ queryKey: ["admin-billing-info"] });
      toast.success("Billing info saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save billing info");
    } finally {
      setBillingSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Admin Settings" description="Manage users, subscription plans, trials, and billing details" />

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="billing-info">Billing Info</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="overflow-hidden">
            <div className="border-b border-border p-6 pb-4">
              <h3 className="font-display text-lg font-semibold">User management</h3>
              <p className="text-sm text-muted-foreground">Update roles, plans, and free download usage.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3 hidden md:table-cell">Downloads used</th>
                    <th className="p-3 hidden lg:table-cell">Joined</th>
                    <th className="p-3">Subscriptions</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((item) => (
                    <AdminUserRow
                      key={item.id}
                      user={item}
                      onSaved={async () => {
                        await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
                        toast.success("User updated");
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card className="p-6">
              <h3 className="font-display text-lg font-semibold">Plan configuration</h3>
              <form className="mt-5 space-y-5" onSubmit={savePricing}>
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField
                  label="Free download limit"
                  value={pricing.freeDownloadLimit}
                  onChange={(value) => setPricing((current) => ({ ...current, freeDownloadLimit: value === "" ? 0 : Number(value) }))}
                />
                <NumberField
                  label="Free trial days"
                  value={pricing.freeTrialDays}
                  onChange={(value) => setPricing((current) => ({ ...current, freeTrialDays: value === "" ? 0 : Number(value) }))}
                />

              </div>

              <div>
                <p className="text-sm font-medium">Subscription plans</p>
                <div className="mt-3 space-y-3">
                  {pricing.plans.map((plan, index) => (
                    <div key={plan.slug} className="grid gap-3 rounded-lg border border-border bg-secondary/30 p-3 lg:grid-cols-[1.2fr_.7fr_.8fr_.8fr_.8fr_.8fr_.8fr_1.5fr]">
                      <TextField label="Plan" value={plan.name} onChange={(value) => updatePlan(index, { name: value })} />
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={plan.isActive === false ? "disabled" : "active"}
                          onValueChange={(value) => updatePlan(index, { isActive: value === "active" })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="disabled">Disabled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <NumberField label="Monthly price" value={plan.monthlyPrice ?? plan.price ?? ""} placeholder="Custom" onChange={(value) => updatePlan(index, { monthlyPrice: value === "" ? null : Number(value), price: value === "" ? null : Number(value) })} />
                      <NumberField label="Annual price" value={plan.annualPrice ?? ""} placeholder="Custom" onChange={(value) => updatePlan(index, { annualPrice: value === "" ? null : Number(value) })} />
                      <NumberField label="Websites" value={plan.websiteLimit ?? ""} placeholder="Custom" onChange={(value) => updatePlan(index, { websiteLimit: value === "" ? null : Number(value) })} />
                      <NumberField label="Users" value={plan.userLimit ?? ""} placeholder="Custom" onChange={(value) => updatePlan(index, { userLimit: value === "" ? null : Number(value) })} />
                      <NumberField label="Exports" value={plan.exportLimit ?? ""} placeholder="Unlimited" onChange={(value) => updatePlan(index, { exportLimit: value === "" ? null : Number(value) })} />
                      <div className="space-y-2">
                        <Label>Features</Label>
                        <Textarea
                          rows={3}
                          value={plan.features.join("\n")}
                          onChange={(event) => updatePlan(index, { features: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Changing prices applies to new Stripe checkouts. Existing active subscriptions continue on their current Stripe billing price.
                </p>
              </div>

              <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save pricing settings</Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="billing-info">
          <Card className="p-6">
            <h3 className="font-display text-lg font-semibold">Billing Info</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Saved seller and payment details are attached as a snapshot when users generate invoices.
            </p>
            {billingInfoLoading ? (
              <p className="mt-5 text-sm text-muted-foreground">Loading billing info...</p>
            ) : (
              <form className="mt-5 space-y-6" onSubmit={saveBillingInfo}>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField label="Company name *" value={billingForm.companyName} onChange={(value) => updateBillingField("companyName", value)} />
                  <TextField label="Billing email *" type="email" value={billingForm.billingEmail} onChange={(value) => updateBillingField("billingEmail", value)} />
                  <TextField label="Phone *" value={billingForm.phone} onChange={(value) => updateBillingField("phone", value)} />
                  <TextField label="Tax ID/VAT" value={billingForm.taxId ?? ""} onChange={(value) => updateBillingField("taxId", value)} />
                  <TextField label="Address line 1 *" value={billingForm.addressLine1} onChange={(value) => updateBillingField("addressLine1", value)} />
                  <TextField label="Address line 2" value={billingForm.addressLine2 ?? ""} onChange={(value) => updateBillingField("addressLine2", value)} />
                  <TextField label="City *" value={billingForm.city} onChange={(value) => updateBillingField("city", value)} />
                  <TextField label="State/Province *" value={billingForm.stateProvince} onChange={(value) => updateBillingField("stateProvince", value)} />
                  <TextField label="ZIP/Postal code *" value={billingForm.postalCode} onChange={(value) => updateBillingField("postalCode", value)} />
                  <TextField label="Country *" value={billingForm.country} onChange={(value) => updateBillingField("country", value)} />
                </div>

                <div className="space-y-2">
                  <Label>Invoice footer note</Label>
                  <Textarea
                    rows={3}
                    value={billingForm.invoiceFooterNote ?? ""}
                    onChange={(event) => updateBillingField("invoiceFooterNote", event.target.value)}
                    placeholder="Optional note shown on downloaded invoices"
                  />
                </div>

                <Button type="submit" disabled={billingSaving}>
                  <Save className="mr-2 h-4 w-4" /> {billingSaving ? "Saving..." : "Save billing info"}
                </Button>
              </form>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  placeholder,
}: {
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  min?: number;
  max?: number;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        min={min}
        max={max}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))}
      />
    </div>
  );
}

const toDateInputValue = (value?: string | Date) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const getDefaultExpirationDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return toDateInputValue(date);
};

function UserSubscriptionsDialog({
  user,
}: {
  user: Awaited<ReturnType<typeof adminService.getUsers>>[number];
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const queryKey = ["admin-user-subscriptions", user.id];
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => adminService.getUserSubscriptions(user.id),
    enabled: open,
  });

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey }),
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Manage</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage subscriptions</DialogTitle>
          <DialogDescription>
            Assign or remove site subscriptions for {user.name}.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading subscriptions...</p>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-3">
              {data?.websites.map((website) => {
                const subscription = data.subscriptions.find((item) => item.websiteId === website.id);
                return (
                  <AdminSubscriptionRow
                    key={website.id}
                    userId={user.id}
                    website={website}
                    subscription={subscription}
                    onSaved={refresh}
                  />
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AdminSubscriptionRow({
  userId,
  website,
  subscription,
  onSaved,
}: {
  userId: string;
  website: { id: string; name: string; url?: string; enabled?: boolean };
  subscription?: AdminUserSubscription;
  onSaved: () => Promise<void>;
}) {
  const [planType, setPlanType] = useState<"Free" | "Pro">(subscription?.planType ?? "Pro");
  const [status, setStatus] = useState<"active" | "expired" | "cancelled">(subscription?.status ?? "active");
  const [expirationDate, setExpirationDate] = useState(toDateInputValue(subscription?.expirationDate) || getDefaultExpirationDate());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPlanType(subscription?.planType ?? "Pro");
    setStatus(subscription?.status ?? "active");
    setExpirationDate(toDateInputValue(subscription?.expirationDate) || getDefaultExpirationDate());
  }, [subscription]);

  const save = async () => {
    setSaving(true);
    try {
      await adminService.upsertUserSubscription(userId, website.id, {
        planType,
        status,
        expirationDate,
      });
      await onSaved();
      toast.success(`${website.name} subscription saved`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save subscription");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await adminService.removeUserSubscription(userId, website.id);
      await onSaved();
      toast.success(`${website.name} subscription removed`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove subscription");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-3 rounded-lg border border-border p-3 lg:grid-cols-[1.4fr_110px_120px_150px_auto] lg:items-end">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{website.name}</p>
          {subscription ? (
            <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
              {subscription.planType} {subscription.status}
            </Badge>
          ) : (
            <Badge variant="outline">Not assigned</Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{website.id}</p>
      </div>

      <div className="space-y-2">
        <Label>Plan</Label>
        <Select value={planType} onValueChange={(value: "Free" | "Pro") => setPlanType(value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Pro">Pro</SelectItem>
            <SelectItem value="Free">Free</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={(value: "active" | "expired" | "cancelled") => setStatus(value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Expires</Label>
        <Input type="date" value={expirationDate} onChange={(event) => setExpirationDate(event.target.value)} />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving || !expirationDate}>
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={remove} disabled={saving || !subscription}>
          Remove
        </Button>
      </div>
    </div>
  );
}

function AdminUserRow({
  user,
  onSaved,
}: {
  user: Awaited<ReturnType<typeof adminService.getUsers>>[number];
  onSaved: () => Promise<void>;
}) {
  const [role, setRole] = useState(user.role);
  const [planType, setPlanType] = useState(user.planType);
  const [downloadCountUsed, setDownloadCountUsed] = useState(user.downloadCountUsed);

  return (
    <tr className="hover:bg-muted/30">
      <td className="p-3">
        <p className="font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </td>
      <td className="p-3">
        <Select value={role} onValueChange={(value: "Admin" | "Partner" | "User") => setRole(value)}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Partner">Partner</SelectItem>
            <SelectItem value="User">User</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="p-3">
        {role === "User" ? (
          <Select value={planType} onValueChange={(value: "Free" | "Pro") => setPlanType(value)}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Free">Free</SelectItem>
              <SelectItem value="Pro">Pro</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <StatusBadge status="Active" />
        )}
      </td>
      <td className="p-3 hidden md:table-cell">
        <Input
          type="number"
          min="0"
          className="w-28"
          value={downloadCountUsed}
          onChange={(event) => setDownloadCountUsed(Number(event.target.value))}
        />
      </td>
      <td className="p-3 hidden lg:table-cell text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
      <td className="p-3">
        <UserSubscriptionsDialog user={user} />
      </td>
      <td className="p-3">
        <Button
          size="sm"
          onClick={async () => {
            await adminService.updateUser(user.id, {
              role,
              planType,
              downloadCountUsed,
            });
            await onSaved();
          }}
        >
          Save
        </Button>
      </td>
    </tr>
  );
}
