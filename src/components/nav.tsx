"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Gift, Wallet, TrendingUp, MonitorPlay } from "lucide-react";

const links = [
  { href: "/", label: "Freebets", icon: Gift },
  { href: "/banca", label: "Banca", icon: Wallet },
  { href: "/dashboard", label: "Value Bets", icon: TrendingUp },
  { href: "/tipster", label: "Tipster", icon: MonitorPlay },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <link.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
