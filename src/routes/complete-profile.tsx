import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { authService } from "@/services/api";
import { firebaseAuth } from "@/services/firebase";
import { isValidPhone, userTypeOptions } from "@/data/userTypes";

export const Route = createFileRoute("/complete-profile")({
  head: () => ({ meta: [{ title: "Complete profile - FlooringIntel" }] }),
  beforeLoad: async () => {
    await authService.getCurrentUser();
  },
  component: CompleteProfilePage,
});

function CompleteProfilePage() {
  const navigate = useNavigate();
  const { data: user } = useQuery({ queryKey: ["current-user"], queryFn: authService.getCurrentUser });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const firebaseName = firebaseAuth.currentUser?.displayName || "";
    setName((current) => current || firebaseName || user?.name || "");
    setPhone((current) => current || user?.phone || "");
    setUserType((current) => current || user?.userType || "");
  }, [user]);

  return (
    <AuthShell
      title="Complete your profile"
      subtitle="Add a few details before entering your dashboard."
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!name.trim()) {
            toast.error("Full name is required");
            return;
          }
          if (!isValidPhone(phone)) {
            toast.error("Enter a valid phone number");
            return;
          }
          if (!userType) {
            toast.error("Select your business type");
            return;
          }

          setLoading(true);
          try {
            await authService.completeProfile({ name, phone, userType });
            toast.success("Profile completed");
            navigate({ to: "/dashboard" });
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to complete profile");
          } finally {
            setLoading(false);
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" required />
        </div>
        <div className="space-y-2">
          <Label>I am a</Label>
          <Select value={userType} onValueChange={setUserType}>
            <SelectTrigger><SelectValue placeholder="Select your business type" /></SelectTrigger>
            <SelectContent>
              {userTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Complete Profile"}
        </Button>
      </form>
    </AuthShell>
  );
}
