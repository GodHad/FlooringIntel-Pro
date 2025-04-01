import { Link } from "@tanstack/react-router";
import logo from "@/assets/main-logo-1.png";
import favicon from "@/assets/favicon.png";
import clsx from "clsx";

export function Logo({ className = "", collapsed = false }: { className?: string, collapsed?: Boolean }) {
  return (
    <Link
      to="/"
      aria-label="FlooringSignal | Daily Flooring Product & Competitor Intelligence"
      className={`group inline-flex items-center ${className}`}
    >
      <img
        src={collapsed ? favicon : logo}
        alt="FlooringSignal logo"
        width={260}
        height={65}
        className={clsx(collapsed ? "h-10" : "h-16", "w-auto max-h-[fit-content] transition-transform group-hover:scale-[1.02]")}
      />
    </Link>
  );
}
