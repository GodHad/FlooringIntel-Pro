import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authService } from "@/services/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in - FlooringIntel" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifyMode, setVerifyMode] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await authService.login(String(form.get("email")), String(form.get("password")));
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed";
      if (message.toLowerCase().includes("verify")) setVerifyMode(true);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await authService.loginWithGoogle();
      toast.success("Signed in with Google");
      navigate({ to: result?.user.profileComplete ? "/dashboard" : "/complete-profile" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your FlooringIntel workspace."
      footer={<>Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline">Create one</Link></>}
    >
      {verifyMode && (
        <div className="mb-4 rounded-md border border-border bg-secondary/50 p-4 text-sm">
          <p className="font-medium">Verify your email</p>
          <p className="mt-1 text-muted-foreground">We sent a verification link to your email. Please verify your email before accessing your dashboard.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => authService.resendVerificationEmail().then(() => toast.success("Verification email sent"))}>Resend verification email</Button>
            <Button type="button" size="sm" onClick={() => authService.reloadAndSyncUser().then(() => navigate({ to: "/dashboard" })).catch((error) => toast.error(error instanceof Error ? error.message : "Still not verified"))}>I verified, continue</Button>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue="user@dezigned.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" defaultValue="123456" required />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox defaultChecked /> Remember me
          </label>
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={loginWithGoogle} disabled={loading}>
          Continue with Google
        </Button>
      </form>
    </AuthShell>
  );
}
