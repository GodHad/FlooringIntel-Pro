import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { adminService } from "@/services/api";

export const Route = createFileRoute("/dashboard/admin-settings")({
  head: () => ({ meta: [{ title: "Admin Settings - FlooringIntel" }] }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminService.getUsers,
  });

  return (
    <div>
      <PageHeader title="Admin Settings" description="Manage user accounts and roles." />

      <Card className="overflow-hidden">
        <div className="border-b border-border p-6 pb-4">
          <h3 className="font-display text-lg font-semibold">User management</h3>
          <p className="text-sm text-muted-foreground">Review users and update account roles.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">User</th>
                <th className="hidden p-3 md:table-cell">Company</th>
                <th className="hidden p-3 lg:table-cell">Phone</th>
                <th className="p-3">Role</th>
                <th className="hidden p-3 lg:table-cell">Joined</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading users...</td>
                </tr>
              )}
              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No users found.</td>
                </tr>
              )}
              {users.map((user) => (
                <AdminUserRow
                  key={user.id}
                  user={user}
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
  const [saving, setSaving] = useState(false);

  return (
    <tr className="hover:bg-muted/30">
      <td className="p-3">
        <p className="font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </td>
      <td className="hidden p-3 text-muted-foreground md:table-cell">{user.company || "-"}</td>
      <td className="hidden p-3 text-muted-foreground lg:table-cell">{user.phone || "-"}</td>
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
      <td className="hidden p-3 text-muted-foreground lg:table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
      <td className="p-3 text-right">
        <Button
          size="sm"
          disabled={saving || role === user.role}
          onClick={async () => {
            setSaving(true);
            try {
              await adminService.updateUser(user.id, { role });
              await onSaved();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Failed to update user");
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </td>
    </tr>
  );
}