import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { authService } from "@/services/api";
import { isValidPhone, userTypeOptions } from "@/data/userTypes";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account - FlooringIntel" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState(false);
  const [userType, setUserType] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("password") !== f.get("confirm")) {
      toast.error("Passwords do not match");
      return;
    }
    if (!isValidPhone(String(f.get("phone") || ""))) {
      toast.error("Enter a valid phone number");
      return;
    }
    if (!userType) {
      toast.error("Select your business type");
      return;
    }
    setLoading(true);
    try {
      await authService.register({
        name: String(f.get("name")),
        company: String(f.get("company") || ""),
        phone: String(f.get("phone")),
        userType,
        email: String(f.get("email")),
        password: String(f.get("password")),
      });
      setVerifyEmail(true);
      toast.success("Please check your email and verify your account before logging in.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const googleRegister = async () => {
    setLoading(true);
    try {
      await authService.loginWithGoogle();
      window.location.href = "/complete-profile";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={verifyEmail ? "Verify your email" : "Create your workspace"}
      subtitle={verifyEmail ? "We sent a verification link to your email." : "Get carpet product data unified in minutes."}
      footer={<>Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link></>}
    >
      {verifyEmail ? (
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
            Please check your email and verify your account before logging in.
          </div>
          <Button className="w-full" variant="outline" onClick={() => authService.resendVerificationEmail().then(() => toast.success("Verification email sent"))}>
            Resend verification email
          </Button>
          <Button className="w-full" onClick={() => window.location.href = "/login"}>Back to login</Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" name="name" required /></div>
          <div className="space-y-2"><Label htmlFor="company">Company name</Label><Input id="company" name="company" /></div>
          <div className="space-y-2"><Label htmlFor="phone">Phone number</Label><Input id="phone" name="phone" type="tel" required /></div>
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
          <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required /></div>
            <div className="space-y-2"><Label htmlFor="confirm">Confirm</Label><Input id="confirm" name="confirm" type="password" required /></div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={googleRegister} disabled={loading}>
            Continue with Google
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
