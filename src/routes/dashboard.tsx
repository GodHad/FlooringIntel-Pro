import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { authService } from "@/services/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — FlooringIntel" }] }),
  beforeLoad: async () => {
    if (typeof window === "undefined") {
      return;
    }

    let user;
    try {
      user = await authService.getCurrentUser();
    } catch {
      throw redirect({ to: "/login" });
    }

    if (user.authProvider === "email" && !user.emailVerified) {
      throw redirect({ to: "/login" });
    }
    if (!user.profileComplete) {
      throw redirect({ to: "/complete-profile" });
    }
  },
  component: DashboardLayout,
});
