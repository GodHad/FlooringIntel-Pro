import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Logo } from "./Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between p-8 lg:p-12">
        <Logo />
        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
        </div>
        <p className="text-xs text-muted-foreground">© 2026 FlooringIntel</p>
      </div>
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_oklch(0.55_0.16_268)_0%,_transparent_50%),radial-gradient(circle_at_70%_80%,_oklch(0.83_0.08_80/0.4)_0%,_transparent_50%)]" />
        <div className="relative flex h-full flex-col justify-end p-12 text-primary-foreground">
          <p className="font-display text-3xl font-semibold leading-snug tracking-tight">
            "FlooringIntel tells us what changed across every brand we carry — before customers walk in asking."
          </p>
          <p className="mt-4 text-sm text-primary-foreground/70">
            — Owner, independent flooring retailer
          </p>
        </div>
      </div>
    </div>
  );
}
